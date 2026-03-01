# Desktop Kitchen — Frictionless Onboarding Strategy

## The Core Principle: Zero-to-First-Order in < 5 Minutes

A restaurant owner shouldn't need to understand your product to start using it.
The entire onboarding should feel like: *type 3 things, hit a button, you're live.*

---

## What Was Wrong With the Original Flow

| Problem | Impact |
|--------|--------|
| 3-step wizard with branding step in critical path | Colors & logos aren't urgent — operators want to ring sales |
| Confirm-password field | +1 cognitive step, no real security benefit (password managers handle this) |
| Plan selection during signup | Forces a premature decision when someone just wants to try it |
| Step 2 (branding) before account creation | Feels like work before the reward |
| No real-time field validation | Errors only shown on "Next" — frustrating on mobile |
| No auto-focus or Enter-key flow | Forces tap/click between every field |

---

## The New Onboarding Architecture

### Phase 1: Signup (single screen, 3 fields)

```
Restaurant name  →  Email  →  Password  →  [Create Free Account]
```

That's it. Everything else is post-signup.

**What gets removed from the critical path:**
- Branding (color, logo) — moved to Settings
- Plan selection — everyone starts on Free Trial automatically
- Confirm password — removed entirely

**What gets added:**
- Real-time validation (field-by-field, on blur)
- Auto-focus on load, Enter key advances focus
- Promo code collapsed by default (visible only to those who have one)
- Trust signals: "14-day free trial · No credit card needed"

---

### Phase 2: Instant Success

The moment they hit Create Account, they get:
1. ✅ Big green check — emotional payoff
2. PIN displayed in large digits with a Copy button
3. Their POS URL
4. One CTA: **Open My POS**

First time they enter their POS, it should feel alive — not empty.

---

### Phase 3: In-App Onboarding Checklist (post-login)

After they land in the POS, show a persistent "Setup" banner until complete:

```
□ Add your first menu item           → goes to Menu
□ Set up your delivery platforms     → goes to Delivery Settings  
□ Customize your branding            → goes to Settings
□ Add a staff member                 → goes to Employees
□ Take your first order              → opens POS
```

Each item deeplinks to the exact screen. Dismiss when all done or after 7 days.

This is more effective than pre-login wizard steps because:
- The owner is now invested (they have an account)
- They can do steps in any order
- They see the product while doing setup

---

## Distribution-Specific Optimizations

### Flyer QR Codes → Pre-filled Signup

Your URL can pre-fill fields and auto-apply promo codes:

```
https://pos.desktop.kitchen/onboarding
  ?promo_code=MEXICO50
  &restaurant_name=Tacos%20El%20Rey
  &email=owner@example.com
```

The onboarding screen already handles this. Print neighborhood-specific flyers with:
- A QR code per neighborhood (Roma, Condesa, Polanco, etc.)
- Promo code already embedded
- Restaurant name pre-filled if you know it (from cold outreach list)

### WhatsApp Drop-off Recovery

After signup, if they don't complete their first order within 48 hours, send a WhatsApp message (via your planned WA integration):

> "Hola 👋 Tu POS de Desktop Kitchen está listo pero no has tomado ningún pedido aún. ¿Necesitas ayuda? Entra aquí: [link]"

---

## The "First 10 Minutes" Experience

This is what will make or break retention. Here's the ideal flow after signup:

**Minute 0–1:** Signup → PIN shown → Enter POS
**Minute 1–3:** See the POS. It should NOT be blank. Pre-populate:
  - A sample menu category ("Tacos") with 3 placeholder items
  - A welcome order in the order history
  - The checklist banner with 5 setup steps

**Minute 3–7:** Owner adds their real menu items (the most important action)
**Minute 7–10:** Takes a test order using their PIN

If they complete a test order in the first session, **retention at Day 30 will be dramatically higher**.

---

## Pre-population: The Secret Weapon

When a new tenant is created, seed their account with:

```js
// server/routes/auth.js — after tenant creation
await seedNewTenant(tenantId, {
  categories: [{ name: 'Platillos', color: '#0d9488' }],
  items: [
    { name: 'Ejemplo: Taco de Res', price: 45, category: 'Platillos' },
    { name: 'Ejemplo: Agua de Jamaica', price: 25, category: 'Platillos' },
  ],
  message: 'Estos son ejemplos — edítalos o bórralos desde Menú'
});
```

The owner sees a real-looking POS immediately, not an empty screen.
This is the difference between "wow this works" and "what do I do now?"

---

## Reducing Password Friction (Future)

Consider a **passwordless flow** for the future:

1. Owner enters email only
2. Receives a magic link
3. Clicks link → logged in as owner, PIN shown
4. Sets password from Settings (optional)

This removes the biggest friction point (passwords) entirely and works better for non-technical restaurant operators.

For now, the current password field is acceptable — just remove confirm-password.

---

## Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Signup completion rate | > 80% | Started form vs. submitted |
| Time to first order | < 10 min | `created_at` vs first order timestamp |
| Day-7 retention | > 60% | Active tenants at D7 / signups |
| Checklist completion | > 50% | Track each checklist item as event |
| Promo code conversion | By code | `promo_code` column in tenants table |

---

## Quick Wins (This Week)

1. **Ship the new single-screen signup** (file attached: `OnboardingScreen.tsx`)
2. **Remove confirm-password field** — already done in the new file
3. **Add seed data on registration** — 2 example menu items so POS isn't empty
4. **Add the in-app checklist** — a sticky banner in the POS dashboard
5. **Pre-fill from URL params** — already working, make sure flyers use this

---

## Bigger Bets (This Month)

- In-app video walkthrough (30 seconds, autoplay on first login)
- WhatsApp welcome message via WABA 24h after signup
- Neighborhood-specific promo codes for tracking flyer ROI
- "Import from Rappi/Uber Eats" menu importer (removes the biggest setup task)

---

*The single biggest unlock for Desktop Kitchen onboarding is making the POS feel alive the moment someone signs up. Pre-seeded data + a clear checklist = operators who stick around.*
