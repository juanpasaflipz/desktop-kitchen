/**
 * Settlement Reconciliation Service
 *
 * Processes incoming Getnet settlement batches, breaks them down per-merchant,
 * calculates fees and holdbacks, and schedules disbursements.
 */

import { adminSql } from '../../db/index.js';
import { calculateHoldback } from './mcaHoldback.js';

/**
 * Process a settlement batch from Getnet.
 * @param {{ batchReference: string, settlementDate: string, merchants: Array<{ tenantId: string, grossAmount: number, transactionCount: number }>, rawData?: object }} batchData
 * @returns {{ batchId: number, lines: object[] }}
 */
export async function processSettlementBatch(batchData) {
  const { batchReference, settlementDate, merchants, rawData } = batchData;

  // Calculate totals
  const totalGross = merchants.reduce((sum, m) => sum + m.grossAmount, 0);
  let totalFees = 0;
  let totalNet = 0;
  const totalTxns = merchants.reduce((sum, m) => sum + m.transactionCount, 0);

  // Create batch record
  const [batch] = await adminSql`
    INSERT INTO getnet_settlement_batches (batch_reference, settlement_date, total_gross, transaction_count, raw_data)
    VALUES (${batchReference}, ${settlementDate}, ${totalGross}, ${totalTxns}, ${JSON.stringify(rawData || {})})
    ON CONFLICT (batch_reference) DO NOTHING
    RETURNING *
  `;

  if (!batch) {
    throw new Error(`Batch ${batchReference} already processed`);
  }

  const lines = [];

  for (const merchant of merchants) {
    // Look up platform fee rate from daily summary or default
    const [feeSummary] = await adminSql`
      SELECT platform_fee_rate FROM platform_fee_ledger
      WHERE tenant_id = ${merchant.tenantId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const platformFeeRate = feeSummary ? parseFloat(feeSummary.platform_fee_rate) : 0.035; // Default 3.5%
    const processorFee = Math.round(merchant.grossAmount * 0.018 * 100) / 100; // Getnet ~1.8%
    const platformFee = Math.round(merchant.grossAmount * platformFeeRate * 100) / 100;

    // Calculate MCA holdback
    const holdback = await calculateHoldback(merchant.tenantId, merchant.grossAmount, settlementDate);
    const mcaHoldback = holdback ? holdback.holdbackAmount : 0;

    const netDisbursement = Math.round((merchant.grossAmount - processorFee - platformFee - mcaHoldback) * 100) / 100;

    totalFees += processorFee + platformFee;
    totalNet += netDisbursement;

    // Check if merchant has a disbursement hold
    const [tenant] = await adminSql`
      SELECT disbursement_hold, disbursement_hold_reason FROM tenants WHERE id = ${merchant.tenantId}
    `;

    const status = tenant?.disbursement_hold ? 'held' : 'pending';
    const holdReason = tenant?.disbursement_hold ? tenant.disbursement_hold_reason : null;

    const [line] = await adminSql`
      INSERT INTO merchant_settlement_lines (
        batch_id, tenant_id, settlement_date, gross_amount,
        processor_fee, platform_fee, mca_holdback, net_disbursement,
        transaction_count, disbursement_status, hold_reason
      ) VALUES (
        ${batch.id}, ${merchant.tenantId}, ${settlementDate}, ${merchant.grossAmount},
        ${processorFee}, ${platformFee}, ${mcaHoldback}, ${netDisbursement},
        ${merchant.transactionCount}, ${status}, ${holdReason}
      )
      RETURNING *
    `;

    lines.push(line);

    // Record in holding account ledger
    await adminSql`
      INSERT INTO holding_account_ledger (entry_type, tenant_id, reference_type, reference_id, credit, debit, balance_after, description)
      VALUES ('settlement_received', ${merchant.tenantId}, 'settlement_line', ${line.id}, ${merchant.grossAmount}, 0,
        (SELECT COALESCE(SUM(credit) - SUM(debit), 0) FROM holding_account_ledger) + ${merchant.grossAmount},
        ${'Settlement batch ' + batchReference})
    `;
  }

  // Update batch totals
  await adminSql`
    UPDATE getnet_settlement_batches
    SET total_fees = ${Math.round(totalFees * 100) / 100},
        total_net = ${Math.round(totalNet * 100) / 100},
        status = 'processed',
        processed_at = NOW()
    WHERE id = ${batch.id}
  `;

  return { batchId: batch.id, lines };
}

/**
 * Pull and process previous day's settlement (called by scheduler).
 */
export async function reconcileDaily() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  console.log(`[Settlement] Reconciling settlement for ${dateStr}`);

  // In production, this would pull from Getnet's API
  // For MVP, check if there are unprocessed getnet transactions for yesterday
  const transactions = await adminSql`
    SELECT tenant_id,
           SUM(amount_centavos)::bigint AS total_centavos,
           COUNT(*)::int AS txn_count
    FROM getnet_transactions
    WHERE status = 'captured'
      AND DATE(captured_at) = ${dateStr}
    GROUP BY tenant_id
  `;

  if (transactions.length === 0) {
    console.log(`[Settlement] No transactions to reconcile for ${dateStr}`);
    return;
  }

  const merchants = transactions.map(t => ({
    tenantId: t.tenant_id,
    grossAmount: parseInt(t.total_centavos, 10) / 100,
    transactionCount: t.txn_count,
  }));

  const batchRef = `GETNET-${dateStr.replace(/-/g, '')}`;

  try {
    const result = await processSettlementBatch({
      batchReference: batchRef,
      settlementDate: dateStr,
      merchants,
    });
    console.log(`[Settlement] Batch ${batchRef} processed: ${result.lines.length} merchants`);
  } catch (err) {
    if (err.message.includes('already processed')) {
      console.log(`[Settlement] Batch ${batchRef} already processed, skipping`);
    } else {
      throw err;
    }
  }
}
