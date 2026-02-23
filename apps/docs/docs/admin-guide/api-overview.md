---
sidebar_position: 4
slug: /admin-guide/api-overview
title: API Overview
---

# API Overview

The Desktop Kitchen POS exposes a REST API for all operations. This overview covers the API structure for developers and integrations.

## Base URL

```
https://pos.desktop.kitchen/api
```

For tenant-specific access, include the `X-Tenant-ID` header or use the tenant's subdomain.

## Authentication

The API uses two authentication systems:

### Employee PIN Auth
For POS operations (orders, payments, menu queries):
- Header: `x-employee-id: <employee_id>`
- Used by the POS frontend

### Owner JWT Auth
For tenant management and billing:
- Header: `Authorization: Bearer <jwt_token>`
- Obtain tokens via `POST /api/auth/login`

## API Routes

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/menu/categories` | List all categories |
| `GET` | `/api/menu/items` | List all menu items |
| `POST` | `/api/menu/items` | Create a menu item |
| `PUT` | `/api/menu/items/:id` | Update a menu item |
| `DELETE` | `/api/menu/items/:id` | Delete a menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List orders |
| `POST` | `/api/orders` | Create an order |
| `PUT` | `/api/orders/:id/status` | Update order status |
| `GET` | `/api/orders/:id` | Get order details |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-intent` | Create Stripe PaymentIntent |
| `POST` | `/api/payments/refund` | Refund a payment |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | List inventory items |
| `POST` | `/api/inventory` | Add inventory item |
| `PUT` | `/api/inventory/:id` | Update stock |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employees` | List employees |
| `POST` | `/api/employees` | Create employee |
| `POST` | `/api/employees/login` | PIN login |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/sales` | Sales summary |
| `GET` | `/api/reports/items` | Item performance |

### Delivery
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/delivery/platforms` | List platforms |
| `GET` | `/api/delivery/markup-rules` | List markup rules |
| `GET` | `/api/delivery-intelligence/pnl` | P&L analytics |

### Loyalty
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/loyalty/customers` | List customers |
| `GET` | `/api/loyalty/config` | Loyalty configuration |

### Branding
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/branding` | Get tenant branding |
| `PUT` | `/api/branding` | Update branding |

## Response Format

All endpoints return JSON:

```json
// Success
{
  "id": 1,
  "name": "Taco al Pastor",
  "price": 45.00
}

// Error
{
  "error": "Item not found"
}
```

## Admin (Super Admin) API

These endpoints are mounted **before** tenant middleware and protected by the `ADMIN_SECRET` header. They use the admin connection pool (`neondb_owner`) which bypasses RLS.

:::info
Admin routes are not tenant-scoped. They operate across all tenants and require `x-admin-secret` header authentication instead of employee PIN or owner JWT.
:::

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/analytics/overview` | Platform-wide KPIs (tenants, MRR, churn) |
| `GET` | `/admin/analytics/signups` | Signup trends over time |
| `GET` | `/admin/analytics/revenue` | Revenue breakdown by plan |
| `GET` | `/admin/analytics/health` | System health metrics |
| `GET` | `/admin/tenants` | List all tenants |
| `POST` | `/admin/tenants` | Create a new tenant |
| `PATCH` | `/admin/tenants/:id` | Update tenant details |
| `DELETE` | `/admin/tenants/:id` | Delete tenant and all data |
| `POST` | `/admin/tenants/:id/seed` | Seed tenant with demo data |
| `POST` | `/admin/tenants/:id/reset-password` | Reset tenant owner password |
| `GET` | `/admin/tenants/:id/export` | Export all tenant data as JSON |
| `GET` | `/admin/tenants/:id/activity` | Recent tenant activity |
| `GET` | `/admin/config` | Platform configuration |
| `PUT` | `/admin/config` | Update platform configuration |
| `GET` | `/admin/audit-log` | Admin action audit trail |
| `POST` | `/admin/impersonate/:id` | Impersonate a tenant (debug) |

## Multi-Tenancy

All tenants share a single Neon Postgres database, isolated by **Row Level Security (RLS)**. Every tenant-scoped table has a `tenant_id` column with RLS policies that filter rows based on `current_setting('app.tenant_id')`.

Tenant resolution happens automatically via:
1. `X-Tenant-ID` header (highest priority)
2. Subdomain (e.g., `yourrestaurant.desktop.kitchen`)
3. `DEFAULT_TENANT_ID` environment variable
4. Default fallback

The backend maintains two connection pools:
- **`adminSql`** (`neondb_owner`) — bypasses RLS, used for auth routes, admin API, and AI background jobs
- **`tenantSql`** (`app_user`) — enforces RLS, used for all tenant-scoped `/api/*` routes

## Tax

All prices are in **MXN**. Tax (16% IVA) is calculated at order creation, not stored on items.

:::note
Full API reference documentation with request/response schemas will be available in a future update. This overview covers the primary endpoints.
:::
