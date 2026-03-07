/**
 * Disbursement Service
 *
 * Processes merchant disbursements via SPEI, manages business day scheduling,
 * and confirms completed transfers.
 */

import { adminSql } from '../../db/index.js';
import { initiateTransfer, checkTransferStatus } from './transferService.js';

// Mexican banking holidays (approximate — update annually)
const BANKING_HOLIDAYS_2026 = [
  '2026-01-01', '2026-02-02', '2026-03-16', '2026-04-02', '2026-04-03',
  '2026-05-01', '2026-09-16', '2026-11-16', '2026-12-25',
];

/**
 * Check if a date is a business day (not weekend, not banking holiday).
 */
function isBusinessDay(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const dateStr = date.toISOString().split('T')[0];
  return !BANKING_HOLIDAYS_2026.includes(dateStr);
}

/**
 * Process disbursements for a target date.
 * @param {string} targetDate - ISO date string (e.g., '2026-03-06')
 */
export async function processDisbursements(targetDate) {
  const today = new Date(targetDate || new Date().toISOString().split('T')[0]);

  if (!isBusinessDay(today)) {
    console.log(`[Disbursement] ${today.toISOString().split('T')[0]} is not a business day, skipping`);
    return { processed: 0, skipped: 'non_business_day' };
  }

  // Get pending settlement lines ready for disbursement
  const lines = await adminSql`
    SELECT sl.*, t.name AS tenant_name, t.disbursement_hold
    FROM merchant_settlement_lines sl
    JOIN tenants t ON t.id = sl.tenant_id
    WHERE sl.disbursement_status = 'pending'
      AND sl.net_disbursement > 0
    ORDER BY sl.settlement_date ASC
  `;

  let processed = 0;
  let errors = 0;

  for (const line of lines) {
    try {
      // Skip if tenant has a hold
      if (line.disbursement_hold) {
        await adminSql`
          UPDATE merchant_settlement_lines
          SET disbursement_status = 'held', hold_reason = 'Tenant disbursement hold active'
          WHERE id = ${line.id}
        `;
        continue;
      }

      // Get primary bank account
      const [bankAccount] = await adminSql`
        SELECT * FROM merchant_bank_accounts
        WHERE tenant_id = ${line.tenant_id}
          AND is_primary = true
          AND verified = true
          AND deleted_at IS NULL
      `;

      if (!bankAccount) {
        await adminSql`
          UPDATE merchant_settlement_lines
          SET disbursement_status = 'held', hold_reason = 'No verified primary bank account'
          WHERE id = ${line.id}
        `;
        continue;
      }

      // Initiate SPEI transfer
      const reference = `DK-${line.id}-${line.settlement_date.toISOString().split('T')[0].replace(/-/g, '')}`;
      const result = await initiateTransfer({
        toClabe: bankAccount.clabe,
        amount: parseFloat(line.net_disbursement),
        reference,
        concept: `Liquidacion ${line.settlement_date.toISOString().split('T')[0]}`,
        beneficiaryName: bankAccount.beneficiary_name,
      });

      // Update line status
      await adminSql`
        UPDATE merchant_settlement_lines
        SET disbursement_status = 'processing',
            disbursement_reference = ${result.transferId},
            disbursement_bank_account_id = ${bankAccount.id}
        WHERE id = ${line.id}
      `;

      // Record in holding account ledger
      await adminSql`
        INSERT INTO holding_account_ledger (entry_type, tenant_id, reference_type, reference_id, debit, credit, balance_after, description)
        VALUES ('merchant_disbursement', ${line.tenant_id}, 'settlement_line', ${line.id}, ${parseFloat(line.net_disbursement)}, 0,
          (SELECT COALESCE(SUM(credit) - SUM(debit), 0) FROM holding_account_ledger) - ${parseFloat(line.net_disbursement)},
          ${'Disbursement to ' + bankAccount.bank_name + ' ' + bankAccount.clabe.slice(-4)})
      `;

      processed++;
    } catch (err) {
      console.error(`[Disbursement] Error processing line ${line.id}:`, err.message);
      errors++;
    }
  }

  console.log(`[Disbursement] Processed: ${processed}, Errors: ${errors}, Total: ${lines.length}`);
  return { processed, errors, total: lines.length };
}

/**
 * Confirm a specific disbursement (admin manually confirms SPEI).
 * @param {number} lineId
 * @param {string} bankReference
 */
export async function confirmDisbursement(lineId, bankReference) {
  const [updated] = await adminSql`
    UPDATE merchant_settlement_lines
    SET disbursement_status = 'completed',
        disbursement_reference = COALESCE(${bankReference}, disbursement_reference),
        disbursed_at = NOW()
    WHERE id = ${lineId}
      AND disbursement_status IN ('processing', 'pending')
    RETURNING *
  `;

  if (!updated) {
    throw new Error(`Settlement line ${lineId} not found or not in confirmable state`);
  }

  return updated;
}

/**
 * Check and confirm pending SPEI transfers (called by scheduler).
 */
export async function confirmPendingDisbursements() {
  const processing = await adminSql`
    SELECT id, disbursement_reference
    FROM merchant_settlement_lines
    WHERE disbursement_status = 'processing'
      AND disbursement_reference IS NOT NULL
  `;

  let confirmed = 0;

  for (const line of processing) {
    const result = await checkTransferStatus(line.disbursement_reference);
    if (result.status === 'completed') {
      await confirmDisbursement(line.id, line.disbursement_reference);
      confirmed++;
    }
  }

  console.log(`[Disbursement] Confirmed ${confirmed} of ${processing.length} pending disbursements`);
  return { confirmed, total: processing.length };
}
