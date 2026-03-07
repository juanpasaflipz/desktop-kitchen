/**
 * MCA Disbursement Service
 *
 * Handles the actual disbursement of merchant cash advances:
 * verifying offers, checking capital pool, creating advance records,
 * and initiating SPEI transfers.
 */

import { adminSql } from '../../db/index.js';
import { initiateTransfer } from './transferService.js';
import { recalculateEstimatedCompletion } from './mcaHoldback.js';

/**
 * Disburse an MCA to a merchant.
 * @param {string} tenantId
 * @param {number} offerId
 * @returns {{ advance: object, transfer: object }}
 */
export async function disburseMCA(tenantId, offerId) {
  // 1. Verify the offer exists, belongs to this tenant, and is accepted
  const [offer] = await adminSql`
    SELECT * FROM merchant_financing_offers
    WHERE id = ${offerId}
      AND tenant_id = ${tenantId}
      AND status = 'accepted'
  `;

  if (!offer) {
    throw new Error('Offer not found, not accepted, or does not belong to this tenant');
  }

  // 2. Verify bank account exists and is verified
  const [bankAccount] = await adminSql`
    SELECT * FROM merchant_bank_accounts
    WHERE tenant_id = ${tenantId}
      AND is_primary = true
      AND verified = true
      AND deleted_at IS NULL
  `;

  if (!bankAccount) {
    throw new Error('No verified primary bank account found. Please add and verify a bank account first.');
  }

  // 3. Check no active advance
  const [existingAdvance] = await adminSql`
    SELECT id FROM merchant_advances
    WHERE tenant_id = ${tenantId}
      AND status IN ('active', 'pending_disbursement')
  `;

  if (existingAdvance) {
    throw new Error('Tenant already has an active or pending advance');
  }

  // 4. Check capital pool
  const [pool] = await adminSql`
    SELECT * FROM mca_capital_pool WHERE id = 1
  `;

  const advanceAmount = parseFloat(offer.offer_amount);
  if (parseFloat(pool.available) < advanceAmount) {
    throw new Error('Insufficient capital pool for this advance');
  }

  // 5. Create advance record
  const totalRepayment = advanceAmount * parseFloat(offer.factor_rate);
  const [advance] = await adminSql`
    INSERT INTO merchant_advances (
      tenant_id, offer_id, advance_amount, factor_rate,
      total_repayment, holdback_percent, remaining_balance,
      status, disbursement_bank_account_id
    ) VALUES (
      ${tenantId}, ${offerId}, ${advanceAmount}, ${parseFloat(offer.factor_rate)},
      ${totalRepayment}, ${parseFloat(offer.holdback_percent)}, ${totalRepayment},
      'pending_disbursement', ${bankAccount.id}
    )
    RETURNING *
  `;

  // 6. Debit capital pool
  await adminSql`
    UPDATE mca_capital_pool
    SET deployed = deployed + ${advanceAmount},
        available = available - ${advanceAmount},
        updated_at = NOW()
    WHERE id = 1
  `;

  // 7. Initiate SPEI transfer
  const reference = `MCA-${advance.id}-${Date.now()}`;
  const transfer = await initiateTransfer({
    toClabe: bankAccount.clabe,
    amount: advanceAmount,
    reference,
    concept: `Adelanto de ventas MCA-${advance.id}`,
    beneficiaryName: bankAccount.beneficiary_name,
  });

  // 8. Update advance with disbursement reference
  await adminSql`
    UPDATE merchant_advances
    SET disbursement_reference = ${transfer.transferId},
        updated_at = NOW()
    WHERE id = ${advance.id}
  `;

  // 9. Record in holding account ledger
  await adminSql`
    INSERT INTO holding_account_ledger (entry_type, tenant_id, reference_type, reference_id, debit, credit, balance_after, description, metadata)
    VALUES ('mca_disbursement', ${tenantId}, 'merchant_advance', ${advance.id}, ${advanceAmount}, 0,
      (SELECT COALESCE(SUM(credit) - SUM(debit), 0) FROM holding_account_ledger) - ${advanceAmount},
      ${'MCA disbursement #' + advance.id},
      ${JSON.stringify({ offer_id: offerId, factor_rate: parseFloat(offer.factor_rate) })})
  `;

  // 10. Log event
  await adminSql`
    INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
    VALUES (${advance.id}, ${tenantId}, 'advance_disbursed', 'system', ${JSON.stringify({
      advance_amount: advanceAmount,
      total_repayment: totalRepayment,
      holdback_percent: parseFloat(offer.holdback_percent),
      bank_account_id: bankAccount.id,
      transfer_id: transfer.transferId,
    })})
  `;

  // 11. Update offer status to 'disbursed'
  await adminSql`
    UPDATE merchant_financing_offers
    SET status = 'disbursed'
    WHERE id = ${offerId}
  `;

  return { advance, transfer };
}

/**
 * Confirm an MCA disbursement (admin confirms SPEI completed).
 * @param {number} advanceId
 * @param {string} bankReference
 */
export async function confirmMCADisbursement(advanceId, bankReference) {
  const [advance] = await adminSql`
    UPDATE merchant_advances
    SET status = 'active',
        disbursed_at = NOW(),
        disbursement_reference = COALESCE(${bankReference}, disbursement_reference),
        updated_at = NOW()
    WHERE id = ${advanceId}
      AND status = 'pending_disbursement'
    RETURNING *
  `;

  if (!advance) {
    throw new Error(`Advance ${advanceId} not found or not in pending_disbursement state`);
  }

  // Calculate estimated completion
  await recalculateEstimatedCompletion(advanceId);

  // Log event
  await adminSql`
    INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
    VALUES (${advanceId}, ${advance.tenant_id}, 'disbursement_confirmed', 'admin', ${JSON.stringify({
      bank_reference: bankReference,
    })})
  `;

  return advance;
}
