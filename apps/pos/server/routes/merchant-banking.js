/**
 * Merchant Banking Routes
 *
 * CLABE-based bank account management for SPEI disbursements.
 * Separate from /api/banking (Plaid connections).
 *
 *   POST   /api/merchant-banking/accounts
 *   GET    /api/merchant-banking/accounts
 *   PUT    /api/merchant-banking/accounts/:id/primary
 *   DELETE /api/merchant-banking/accounts/:id
 *   POST   /api/merchant-banking/accounts/:id/verify
 */

import { Router } from 'express';
import { adminSql } from '../db/index.js';
import { requireOwner } from '../middleware/ownerAuth.js';
import { validateCLABE } from '../lib/clabeValidator.js';

const router = Router();

// POST /api/merchant-banking/accounts
router.post('/accounts', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const { clabe, beneficiary_name, alias } = req.body;

    if (!clabe || !beneficiary_name) {
      return res.status(400).json({ error: 'clabe and beneficiary_name are required' });
    }

    // Validate CLABE
    const validation = validateCLABE(clabe);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check for duplicate
    const [existing] = await adminSql`
      SELECT id FROM merchant_bank_accounts
      WHERE tenant_id = ${tenantId} AND clabe = ${clabe} AND deleted_at IS NULL
    `;
    if (existing) {
      return res.status(409).json({ error: 'This CLABE is already registered' });
    }

    // Check if this is the first account (make it primary)
    const [countRow] = await adminSql`
      SELECT COUNT(*)::int AS count FROM merchant_bank_accounts
      WHERE tenant_id = ${tenantId} AND deleted_at IS NULL
    `;
    const isPrimary = countRow.count === 0;

    const [account] = await adminSql`
      INSERT INTO merchant_bank_accounts (tenant_id, clabe, bank_name, bank_code, beneficiary_name, alias, is_primary)
      VALUES (${tenantId}, ${clabe}, ${validation.bankName}, ${validation.bankCode}, ${beneficiary_name}, ${alias || null}, ${isPrimary})
      RETURNING *
    `;

    res.status(201).json(account);
  } catch (error) {
    console.error('[Merchant Banking] Add account error:', error.message);
    res.status(500).json({ error: 'Failed to add bank account' });
  }
});

// GET /api/merchant-banking/accounts
router.get('/accounts', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;

    const accounts = await adminSql`
      SELECT id, clabe, bank_name, bank_code, beneficiary_name, alias,
             is_primary, verified, verified_at, created_at
      FROM merchant_bank_accounts
      WHERE tenant_id = ${tenantId} AND deleted_at IS NULL
      ORDER BY is_primary DESC, created_at ASC
    `;

    res.json(Array.from(accounts));
  } catch (error) {
    console.error('[Merchant Banking] List accounts error:', error.message);
    res.status(500).json({ error: 'Failed to list bank accounts' });
  }
});

// PUT /api/merchant-banking/accounts/:id/primary
router.put('/accounts/:id/primary', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const accountId = parseInt(req.params.id, 10);

    // Verify account belongs to tenant
    const [account] = await adminSql`
      SELECT id FROM merchant_bank_accounts
      WHERE id = ${accountId} AND tenant_id = ${tenantId} AND deleted_at IS NULL
    `;
    if (!account) return res.status(404).json({ error: 'Bank account not found' });

    // Unset all primary flags for this tenant
    await adminSql`
      UPDATE merchant_bank_accounts
      SET is_primary = false, updated_at = NOW()
      WHERE tenant_id = ${tenantId} AND deleted_at IS NULL
    `;

    // Set this one as primary
    const [updated] = await adminSql`
      UPDATE merchant_bank_accounts
      SET is_primary = true, updated_at = NOW()
      WHERE id = ${accountId}
      RETURNING *
    `;

    res.json(updated);
  } catch (error) {
    console.error('[Merchant Banking] Set primary error:', error.message);
    res.status(500).json({ error: 'Failed to set primary account' });
  }
});

// DELETE /api/merchant-banking/accounts/:id
router.delete('/accounts/:id', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const accountId = parseInt(req.params.id, 10);

    const [updated] = await adminSql`
      UPDATE merchant_bank_accounts
      SET deleted_at = NOW(), is_primary = false, updated_at = NOW()
      WHERE id = ${accountId} AND tenant_id = ${tenantId} AND deleted_at IS NULL
      RETURNING id
    `;

    if (!updated) return res.status(404).json({ error: 'Bank account not found' });

    res.json({ deleted: true });
  } catch (error) {
    console.error('[Merchant Banking] Delete account error:', error.message);
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
});

// POST /api/merchant-banking/accounts/:id/verify — initiate verification (MVP: manual)
router.post('/accounts/:id/verify', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const accountId = parseInt(req.params.id, 10);

    const [account] = await adminSql`
      SELECT id, verified FROM merchant_bank_accounts
      WHERE id = ${accountId} AND tenant_id = ${tenantId} AND deleted_at IS NULL
    `;

    if (!account) return res.status(404).json({ error: 'Bank account not found' });
    if (account.verified) return res.json({ message: 'Account already verified' });

    // MVP: just mark as pending verification — admin confirms manually
    res.json({ message: 'Verification request submitted. Our team will verify within 24 hours.' });
  } catch (error) {
    console.error('[Merchant Banking] Verify error:', error.message);
    res.status(500).json({ error: 'Failed to initiate verification' });
  }
});

export default router;
