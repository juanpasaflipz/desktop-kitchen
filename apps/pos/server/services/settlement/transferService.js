/**
 * Transfer Service — Abstract SPEI interface
 *
 * MVP: Logs transfers and returns manual references.
 * Designed for easy swap to Santander API / STP later.
 */

import crypto from 'crypto';
import { adminSql } from '../../db/index.js';

/**
 * Initiate a SPEI transfer.
 * MVP: creates a ledger reference for manual processing.
 * @param {{ toClabe: string, amount: number, reference: string, concept: string, beneficiaryName: string }} params
 * @returns {{ transferId: string, status: string, reference: string }}
 */
export async function initiateTransfer({ toClabe, amount, reference, concept, beneficiaryName }) {
  const transferId = `TRF-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  console.log(`[TransferService] SPEI transfer initiated: ${transferId}`);
  console.log(`  To: ${toClabe} (${beneficiaryName})`);
  console.log(`  Amount: $${amount.toFixed(2)} MXN`);
  console.log(`  Reference: ${reference}`);
  console.log(`  Concept: ${concept}`);

  // In production, this would call Santander/STP API
  // For MVP, we log and return a pending status for manual confirmation
  return {
    transferId,
    status: 'pending_manual',
    reference,
    message: 'Transfer queued for manual SPEI processing',
  };
}

/**
 * Check SPEI transfer status.
 * MVP: always returns 'pending' — admin manually confirms.
 * @param {string} reference
 * @returns {{ status: string, confirmedAt: string|null }}
 */
export async function checkTransferStatus(reference) {
  // In production, this would query the bank API
  return {
    status: 'pending',
    confirmedAt: null,
  };
}
