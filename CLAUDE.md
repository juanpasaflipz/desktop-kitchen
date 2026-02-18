# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start both client (Vite :5173) and server (Express :3001) concurrently
npm run dev:client       # Vite dev server only
npm run dev:server       # Express backend only
npm run build            # Production build (outputs to /dist)
npm run start            # Production mode (NODE_ENV=production, serves /dist)
npm run seed             # Seed database with demo data (employees, menu, inventory)
```

No test runner is configured.

## Architecture

Full-stack POS system for a Mexican restaurant chain. React + TypeScript frontend, Express.js backend, SQL.js (in-memory SQLite with file persistence) database.

**Frontend** (Vite on :5173) proxies `/api` requests to the **backend** (Express on :3001). In production, Express serves the built frontend from `/dist` with SPA fallback routing.

### Frontend (`src/`)

- **React 18 + TypeScript + Tailwind CSS + Vite**
- Routing: `react-router-dom` v6 in `App.tsx`
- Auth: `AuthContext` (PIN-based employee login, role-based route protection via `ProtectedRoute`)
- Roles: `cashier`, `kitchen`, `manager`, `admin` — each role gates access to specific routes
- API client: `src/api/index.ts` — all fetch calls to `/api/*`, typed responses
- Types: `src/types/index.ts` — all shared interfaces (30+ types)
- Charts: `recharts` for reports; Icons: `lucide-react`
- State: React Context + local component state (no Redux/Zustand)
- Screens are in `src/screens/`, reusable components in `src/components/`

### Backend (`server/`)

- **Express.js with ES modules** (`"type": "module"` in package.json)
- Entry: `server/index.js` — mounts all route files under `/api/*`
- Database: `server/db.js` — SQL.js with helpers (`run`, `get`, `all`, `exec`), auto-saves to `/data/juanbertos.db`
- Routes: 11 files in `server/routes/` (menu, orders, payments, inventory, employees, reports, modifiers, combos, printers, delivery, ai)
- Payments: Stripe integration (PaymentIntents, refunds, split payments)
- Tax rate: 16% IVA (Mexican tax, hardcoded in order creation)
- Currency: MXN

### AI Intelligence Layer (`server/ai/`)

Background scheduler runs 5 jobs (suggestion cache refresh, hourly snapshots, item pair tracking, inventory velocity, cache cleanup). Heuristic-based suggestions always active; Grok API integration optional (requires `XAI_API_KEY`). Suggestion types: upsell, inventory-push, combo-upgrade, dynamic-pricing.

### Database

30+ tables in SQL.js. Schema is defined inline in `server/db.js` using `CREATE TABLE IF NOT EXISTS`. Key domains: employees, menu (categories/items/modifiers/combos), orders (items/modifiers/payments), inventory, printers, delivery platforms, AI (suggestions/cache/analytics/config). No migrations system — schema changes go directly in `db.js`.

## Environment Variables

Copy `.env.example` to `.env`:
```
STRIPE_SECRET_KEY=sk_test_...           # Required for payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Required for browser Stripe
PORT=3001                               # Optional (default: 3001)
XAI_API_KEY=...                         # Optional (enables Grok AI suggestions)
```

## Key Patterns

- **API pattern**: Routes return JSON. Success: `res.json(data)`. Errors: `res.status(4xx).json({ error: 'message' })`.
- **Order flow**: Cart state in POSScreen → `POST /api/orders` (calculates tax, generates order_number) → payment via Stripe or cash → inventory deduction.
- **Order statuses**: `pending` → `confirmed` → `preparing` → `ready` → `completed` (or `cancelled`).
- **Payment statuses**: `unpaid` → `processing` → `paid` → `completed` (or `failed`/`refunded`).
- **Modifiers**: Modifier groups assigned to menu items. Orders store selected modifiers with price adjustments in `order_item_modifiers`.
- **Combos**: `combo_definitions` with `combo_slots` (each slot allows a category or specific item). Orders track combo items via `combo_instance_id` (UUID).
- **Delivery sources**: Orders have a `source` field (`pos`, `uber_eats`, `rappi`, `didi_food`) for channel tracking.
- **Path alias**: `@/*` maps to `src/*` (configured in tsconfig.json and vite.config.ts).
