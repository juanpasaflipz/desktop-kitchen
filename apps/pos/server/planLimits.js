export const PLAN_LIMITS = {
  trial: {
    menuItems: 10,
    inventoryItems: 12,
    employees: 3,
    modifierGroups: 2,
    combos: 1,
    maxBankConnections: 0,
    reports: { editVariables: false },
    ai: { mode: 'mock', monthlyAnalyses: 0 },
    printers: { functional: false },
    delivery: { functional: false },
    permissions: { locked: true },
    loyalty: { locked: true },
    branding: { canRename: false },
    prepForecast: { locked: true },
    menuBoard: { canRenameBrands: false },
    dynamicPricing: { aiSuggestions: false, scheduledRules: false, priceHistory: false, guardrails: false, abTesting: false, deliveryIntegration: false },
    stressTest: { locked: true },
    banking: { locked: true },
    bankReconciliation: { locked: true },
  },
  starter: {
    menuItems: Infinity,
    inventoryItems: Infinity,
    employees: Infinity,
    modifierGroups: 15,
    combos: 10,
    maxBankConnections: 0,
    reports: { editVariables: true },
    ai: { mode: 'locked', monthlyAnalyses: 0 },
    printers: { functional: true },
    delivery: { functional: true },
    permissions: { locked: false },
    loyalty: { locked: false },
    branding: { canRename: true },
    prepForecast: { locked: false },
    menuBoard: { canRenameBrands: true },
    dynamicPricing: { aiSuggestions: false, scheduledRules: false, priceHistory: false, guardrails: false, abTesting: false, deliveryIntegration: false },
    stressTest: { locked: true },
    banking: { locked: true },
    bankReconciliation: { locked: true },
  },
  pro: {
    menuItems: Infinity,
    inventoryItems: Infinity,
    employees: Infinity,
    modifierGroups: Infinity,
    combos: Infinity,
    maxBankConnections: 2,
    reports: { editVariables: true },
    ai: { mode: 'full', monthlyAnalyses: 100 },
    printers: { functional: true },
    delivery: { functional: true },
    permissions: { locked: false },
    loyalty: { locked: false },
    branding: { canRename: true },
    prepForecast: { locked: false },
    menuBoard: { canRenameBrands: true },
    dynamicPricing: { aiSuggestions: true, scheduledRules: true, priceHistory: true, guardrails: true, abTesting: false, deliveryIntegration: false },
    stressTest: { locked: false },
    banking: { locked: false },
    bankReconciliation: { locked: true },
  },
  ghost_kitchen: {
    menuItems: Infinity,
    inventoryItems: Infinity,
    employees: Infinity,
    modifierGroups: Infinity,
    combos: Infinity,
    maxBankConnections: 5,
    reports: { editVariables: true },
    ai: { mode: 'full', monthlyAnalyses: Infinity },
    printers: { functional: true },
    delivery: { functional: true },
    permissions: { locked: false },
    loyalty: { locked: false },
    branding: { canRename: true },
    prepForecast: { locked: false },
    menuBoard: { canRenameBrands: true },
    dynamicPricing: { aiSuggestions: true, scheduledRules: true, priceHistory: true, guardrails: true, abTesting: true, deliveryIntegration: true },
    stressTest: { locked: false },
    banking: { locked: false },
    bankReconciliation: { locked: false },
  },
};

export const PLAN_TIERS = ['trial', 'starter', 'pro', 'ghost_kitchen'];

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.trial;
}

/**
 * Finds the lowest plan tier that unlocks a feature.
 * Handles: locked: false, functional: true, numeric limits > 0, boolean true, nested subKeys.
 */
export function getRequiredPlan(feature, subKey) {
  for (const tier of PLAN_TIERS) {
    const limits = PLAN_LIMITS[tier];
    const val = limits[feature];
    if (val === undefined) continue;

    if (subKey) {
      const sub = val?.[subKey];
      if (sub === true || (typeof sub === 'number' && sub > 0)) return tier;
      continue;
    }

    // Numeric limit (e.g., menuItems: 10 → unlocked at trial)
    if (typeof val === 'number') {
      if (val > 0) return tier;
      continue;
    }

    // Object with locked/functional flags or custom boolean/string keys
    if (typeof val === 'object') {
      if (val.locked === false || val.functional === true) return tier;
      // For objects without locked/functional (e.g., reports.editVariables, branding.canRename, ai.mode),
      // consider unlocked if any value is truthy and not 'mock'/'locked'
      if (!('locked' in val) && !('functional' in val)) {
        const hasUnlockedValue = Object.values(val).some(v =>
          v === true || (typeof v === 'number' && v > 0) || (typeof v === 'string' && v !== 'mock' && v !== 'locked')
        );
        if (hasUnlockedValue) return tier;
      }
      continue;
    }

    // Boolean
    if (val === true) return tier;
  }
  return 'ghost_kitchen'; // fallback to highest tier
}

/**
 * Builds the standardized plan-upgrade error body.
 * @param {string} feature - Feature key from PLAN_LIMITS
 * @param {string} currentPlan - Tenant's current plan
 * @param {object} [extra] - Optional { limit, current } for numeric limits
 */
export function planUpgradeError(feature, currentPlan, extra) {
  return {
    error: 'PLAN_UPGRADE_REQUIRED',
    requiredPlan: getRequiredPlan(feature),
    feature,
    currentPlan,
    ...extra,
  };
}

export function checkLimit(plan, resource, currentCount) {
  const max = getPlanLimits(plan)[resource];
  if (typeof max !== 'number') return { allowed: true };
  return currentCount >= max
    ? { allowed: false, limit: max, current: currentCount, plan }
    : { allowed: true, limit: max, current: currentCount };
}

/**
 * Middleware factory: blocks the request if the feature is locked on the tenant's plan.
 * Usage: router.post('/some-pro-feature', requirePlanFeature('delivery'), handler)
 */
export function requirePlanFeature(feature) {
  return (req, res, next) => {
    const plan = req.tenant?.plan || 'trial';
    const limits = getPlanLimits(plan);
    const featureLimits = limits[feature];

    if (featureLimits && (featureLimits.locked === true || featureLimits.functional === false)) {
      return res.status(403).json(planUpgradeError(feature, plan));
    }
    next();
  };
}
