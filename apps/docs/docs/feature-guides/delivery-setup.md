---
sidebar_position: 5
slug: /feature-guides/delivery-setup
title: Delivery Setup
---

# Delivery Setup

Connect delivery platforms, configure markup rules, and manage virtual brands to maximize delivery revenue.

## Connecting Platforms

The system supports three delivery platforms:
- **Uber Eats**
- **Rappi**
- **DiDi Food**

### Adding a Platform
1. Go to **Delivery** > **Platforms**
2. Select the platform to connect
3. Enter your platform credentials/API keys
4. Enable the connection

Once connected, orders from the platform flow into your kitchen queue alongside POS orders. Each delivery order shows its **source** so staff knows the origin.

## Markup Rules

Delivery platforms charge commissions (typically 15-30%). Markup rules let you adjust prices for delivery to protect your margins.

### Creating Markup Rules
1. Go to **Delivery** > **Markup Rules**
2. Select a platform
3. Choose the scope:
   - **Per item**: Adjust specific menu items
   - **Per category**: Adjust all items in a category
4. Set the adjustment type:
   - **Percentage**: e.g., +25%
   - **Fixed amount**: e.g., +$20 MXN
5. Save

### Example

If a taco costs $45 MXN in-house and Uber Eats charges 25% commission:
- Set a +30% markup for the Tacos category on Uber Eats
- Delivery price: $58.50 MXN
- After 25% commission: $43.88 MXN (close to in-house margin)

## Virtual Brands

A single kitchen can operate multiple "brands" on delivery platforms. See [Multi-Brand Setup](../admin-guide/multi-brand) for full details.

### Quick Setup
1. Go to **Delivery** > **Virtual Brands**
2. Create a brand (e.g., "Wing Factory")
3. Select which menu items appear under this brand
4. Assign the brand to specific platforms
5. Customize branding (name, description)

## Order Flow

```
Delivery Platform → API → Desktop Kitchen Backend → Kitchen Display
                                    │
                                    ├── POS alert banner (live)
                                    ├── Order tagged with source
                                    ├── Markup rules applied
                                    └── P&L tracked per platform
```

When a delivery order arrives, two things happen:

1. **POS screen**: A colored alert banner appears showing the platform, order number, customer name, and a live elapsed timer. Staff see this immediately without leaving the POS. See [POS Operations — Delivery Alert Banner](./pos-operations#delivery-alert-banner) for details.
2. **Kitchen display**: The order appears in the kitchen queue with a platform badge so kitchen staff can prepare it.
