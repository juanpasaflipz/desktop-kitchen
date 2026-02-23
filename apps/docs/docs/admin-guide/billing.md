---
sidebar_position: 1
slug: /admin-guide/billing
title: Billing & Subscriptions
---

# Billing & Subscriptions

Manage your subscription plan, payment method, and billing history through the Stripe-powered billing portal.

## Plans

| Feature | Trial | Starter | Pro |
|---------|-------|---------|-----|
| POS & orders | Yes | Yes | Yes |
| Menu management | Yes | Yes | Yes |
| Kitchen display | Yes | Yes | Yes |
| Inventory | - | Yes | Yes |
| Reports | Basic | Full | Full |
| Delivery integrations | - | - | Yes |
| Delivery intelligence | - | - | Yes |
| AI suggestions | - | - | Yes |
| Virtual brands | - | - | Yes |
| Loyalty & CRM | - | Yes | Yes |
| Custom branding | - | - | Yes |

## Managing Your Subscription

### Upgrading
1. Go to **Settings** > **Billing**
2. Select the plan you'd like to upgrade to
3. You'll be redirected to Stripe Checkout
4. Complete the payment
5. Your plan upgrades immediately

### Downgrading
1. Go to **Settings** > **Billing** > **Manage Subscription**
2. This opens the Stripe Customer Portal
3. Select a lower plan
4. The change takes effect at the end of your current billing period

### Cancelling
1. Open the Stripe Customer Portal from **Settings** > **Billing**
2. Cancel your subscription
3. Access continues until the end of the paid period

## Payment Methods

Manage payment methods through the Stripe Customer Portal:
- Add or remove credit/debit cards
- Set a default payment method
- View upcoming invoices

## Billing Events

The system handles these billing events automatically:

| Event | Action |
|-------|--------|
| Checkout completed | Plan activated, tenant updated |
| Subscription updated | Plan level changed |
| Subscription deleted | Reverted to trial |
| Payment failed | Notification sent, grace period starts |

## Invoices

Access your complete billing history and download invoices from the Stripe Customer Portal.

## Stripe Webhook

The billing system relies on a Stripe webhook to stay in sync with subscription changes.

**Webhook URL:** `https://pos.desktop.kitchen/api/billing/webhook`

### Handled Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activates the plan, links Stripe customer to tenant |
| `customer.subscription.updated` | Updates plan level (starter/pro) |
| `customer.subscription.deleted` | Reverts tenant to trial plan |
| `invoice.payment_failed` | Logs failure, begins grace period |

### Configuration

1. In the [Stripe Dashboard](https://dashboard.stripe.com/webhooks), create an endpoint pointing to `https://pos.desktop.kitchen/api/billing/webhook`
2. Select the four events listed above
3. Copy the signing secret and set it as the `STRIPE_WEBHOOK_SECRET` environment variable

:::caution Raw body required
The webhook route is mounted **before** `express.json()` middleware so that Stripe can verify the raw request body signature. If you add global body-parsing middleware, ensure the webhook route is excluded.
:::
