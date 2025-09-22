# ImprestFlow

A production-ready React + TypeScript application that streamlines cash advance requests and retirement workflows with auditability, policy enforcement, and finance dashboards.

## Features

- Role-based experience for employees, managers, finance, and admins
- Advance request and retirement wizards backed by Zod validation and React Hook Form
- Lightweight workflow state machine with audit logging
- Finance dashboard with aging analysis, cost center exposure, and CSV/JSON export stubs
- Pluggable data layer with Supabase, Firebase, or in-memory adapters
- Tailwind + shadcn-inspired UI components with dark mode, accessibility, and responsive layouts
- Vitest unit tests and Playwright end-to-end scenarios
- Postgres schema, row-level security examples, and seed data script

## Getting started

```bash
npm install
npm run dev
```

> **Note:** If package installation is restricted, mirror npm to an accessible registry or download dependencies manually.

### Environment variables

Copy `.env.example` (to be created) and set the following if connecting to Supabase or Firebase:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

By default the app uses the in-memory data client with seeded demo data.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build production bundle |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Execute Playwright scenarios (requires `npm run dev` in another terminal) |
| `npm run seed` | Generate `seed-data.json` with demo records |

## Testing

Unit and integration tests live in `src/test`. End-to-end specs reside in `tests/e2e` and assume the local dev server runs at `http://localhost:5173`.

## Data layer

`src/lib/data/data-client.ts` defines the contract. Swap implementations by wrapping the app in the desired provider (Supabase or Firebase). Supabase RPC hooks expect SQL functions provided in `/db`.

## Database

- `db/schema.sql` – Postgres DDL
- `db/rls.sql` – Supabase RLS policies

Run the scripts in order when provisioning a new Supabase project.

## Security & compliance

- Role-aware routing via `RequireRole`
- Policy alerts for per-diem caps, receipt thresholds, and retirement deadlines
- Audit timeline exposing actor, timestamps, and before/after payloads
- File upload placeholder with antivirus hook comment (actual implementation required)

## Walkthrough script

1. Sign in as Erin (default) and create a new advance via **New request**.
2. Switch role to Manager, review the request in **Awaiting My Action**, and approve.
3. Switch to Finance, record disbursement, and observe dashboard metrics update.
4. Return as Erin, add retirement line items with receipts, submit for verification.
5. As Finance, verify the retirement, observe outstanding balance drop and audit logs capture transitions.

Capture screenshots of the three primary pages for documentation.
