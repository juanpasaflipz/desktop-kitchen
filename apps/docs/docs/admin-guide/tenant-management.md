---
sidebar_position: 4
slug: /admin-guide/tenant-management
title: Tenant Management
---

# Tenant Management

The Super Admin dashboard provides full control over tenant onboarding, configuration, and offboarding from a single interface.

## Accessing the Dashboard

Navigate to:

```
https://pos.desktop.kitchen/#/super-admin
```

You'll be prompted for the **Admin Secret** — this is the `ADMIN_SECRET` environment variable set on the server. The secret is stored in `sessionStorage` for the duration of your browser session.

:::caution Separate authentication
Super Admin access is independent from both the employee PIN system and the owner JWT system. It uses a shared secret specifically for platform-level operations.
:::

## Dashboard Tabs

### Overview

Platform-wide KPIs at a glance:

- Total tenants, active tenants, and churn rate
- Monthly recurring revenue (MRR) and plan distribution
- Recent signups and tenant activity timeline

### Tenants

Full tenant list with search, filter by plan, and inline actions:

- **Create** — onboard a new tenant
- **Edit** — update name, subdomain, plan, branding
- **Reset Password** — generate a new owner password
- **Export** — download all tenant data as JSON
- **Delete** — permanently remove a tenant and all its data

### Revenue

Revenue analytics:

- MRR trends over time
- Revenue breakdown by plan (trial, starter, pro)
- Stripe subscription status overview

### Health

System health monitoring:

- Database connection pool status
- Background job execution history
- Error rates and recent failures

## Tenant Lifecycle

### Creating a Tenant

1. Click **Create Tenant** on the Tenants tab
2. Fill in required fields: tenant name, subdomain, owner email
3. Select a plan (trial, starter, or pro)
4. Click **Create** — this creates the tenant record and sets up RLS context
5. Click **Seed** on the new tenant row to populate demo data (categories, menu items, employees, inventory)

After seeding, a default admin employee is created with a generated PIN. If `RESEND_API_KEY` is configured, the PIN is emailed to the owner.

### Editing a Tenant

Click the **Edit** button on any tenant row to update:

- Tenant name and subdomain
- Plan level
- Branding (primary color, logo URL)
- Stripe customer and subscription IDs

### Resetting Owner Password

Click **Reset Password** to generate a new owner password. The new password is displayed once — copy it immediately or it will be lost.

### Exporting Tenant Data

Click **Export** to download a JSON file containing all of the tenant's data across every table. This is useful for:

- Backup before migration
- Compliance / data portability requests
- Debugging tenant-specific issues

### Deleting a Tenant

Deletion is permanent and irreversible. The delete flow:

1. Click **Delete** on the tenant row
2. A confirmation modal appears requiring you to type the tenant ID
3. Confirm deletion
4. The system runs a cascading delete across all 46 tenant-scoped tables in a single transaction
5. The tenant record itself is removed last

:::danger
Tenant deletion cannot be undone. Always export tenant data before deleting. The delete operation removes data from all tables including orders, payments, inventory, loyalty customers, AI data, and configuration.
:::

## API Endpoints

All super admin endpoints are documented in the [API Overview](/admin-guide/api-overview#admin-super-admin-api). They require the `x-admin-secret` header and operate outside the tenant middleware.
