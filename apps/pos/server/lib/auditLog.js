import { adminSql } from '../db/index.js';

/**
 * Write an audit log entry. Fire-and-forget — never blocks the request.
 *
 * @param {object} params
 * @param {string} params.tenantId
 * @param {string} params.actorType - 'employee' | 'owner' | 'system' | 'admin'
 * @param {string} [params.actorId]
 * @param {string} params.action - 'create' | 'update' | 'delete'
 * @param {string} params.resource - table/entity name
 * @param {string} [params.resourceId]
 * @param {object} [params.details] - arbitrary JSON (changed fields, etc.)
 * @param {string} [params.ip]
 */
export function audit({ tenantId, actorType, actorId, action, resource, resourceId, details, ip }) {
  adminSql`
    INSERT INTO audit_log (tenant_id, actor_type, actor_id, action, resource, resource_id, details, ip_address)
    VALUES (${tenantId}, ${actorType}, ${actorId || null}, ${action}, ${resource}, ${resourceId || null}, ${details ? JSON.stringify(details) : null}::jsonb, ${ip || null})
  `.catch(err => {
    console.error('[Audit] Failed to write audit log:', err.message);
  });
}

/**
 * Write to BOTH audit_log AND merchant_financing_events.
 * Used for all financing-related actions to ensure comprehensive audit trail.
 * Fire-and-forget — never blocks the request.
 *
 * @param {object} params
 * @param {string} params.tenantId
 * @param {string} params.actorType - 'owner' | 'system' | 'admin'
 * @param {string} [params.actorId] - email, 'cron_scheduler', or admin identifier
 * @param {string} params.eventType - e.g. 'consent_granted', 'offer_accepted'
 * @param {string} params.resource - 'financing_consent' | 'financial_profile' | 'financing_offer'
 * @param {string|number} [params.resourceId]
 * @param {object} [params.details] - action-specific data
 * @param {string} [params.ip]
 * @param {string} [params.userAgent]
 */
export function auditFinancing({ tenantId, actorType, actorId, eventType, resource, resourceId, details, ip, userAgent }) {
  const fullDetails = {
    ...details,
    ...(userAgent ? { user_agent: userAgent } : {}),
  };
  const detailsJson = JSON.stringify(fullDetails);

  // 1. Write to audit_log
  adminSql`
    INSERT INTO audit_log (tenant_id, actor_type, actor_id, action, resource, resource_id, details, ip_address)
    VALUES (${tenantId}, ${actorType}, ${actorId || null}, ${eventType}, ${resource}, ${resourceId || null}, ${detailsJson}::jsonb, ${ip || null})
  `.catch(err => {
    console.error('[Audit] Failed to write financing audit log:', err.message);
  });

  // 2. Write to merchant_financing_events
  adminSql`
    INSERT INTO merchant_financing_events (tenant_id, event_type, details)
    VALUES (${tenantId}, ${eventType}, ${detailsJson}::jsonb)
  `.catch(err => {
    console.error('[Audit] Failed to write financing event:', err.message);
  });
}
