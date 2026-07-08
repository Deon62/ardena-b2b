# Ardena for Business

Fleet and rental management for car hire businesses in Kenya, by [Ardena](https://ardena.co.ke). Businesses run their whole rental operation from one dashboard: fleet, bookings, renter verification, M-Pesa payments, staff and billing. Multi-tenant, with every business in its own isolated workspace.

Built with **Vite + React** in plain **JavaScript** and plain **CSS**. No TypeScript, no Tailwind, no UI framework.

## Getting started

```bash
npm install
npm run dev       # dev server on http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

### Configuration

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL | `https://api.ardena.xyz/api/v1/b2b` |

No `.env` file is required for local work; the client points at the live API by default.

## How it fits together

The marketing site and the dashboard live in one SPA, routed with React Router (`src/App.jsx`). The dashboard sits behind `RequireAuth` and access is request-only: there is no self-serve signup, `/signup` submits an access request and the Ardena team verifies the business before sending credentials.

```
src/
  pages/        Public site: landing, about, pricing, contact, auth,
                and /v/:slug (the public "Ardena Verified" trust page)
  dashboard/    The product: one .jsx per screen plus its *Store.js
  lib/          api.js (API client) and authStore.js (session)
  components/   Shared bits: dropdowns, dialogs, logo, badges
  hooks/        usePageTitle, useReveal
docs/
  backend-api.md   The API contract the backend builds against
scripts/
  remove-dashes.mjs   Copy rule: no em dashes in UI text
```

### Data layer

Every dashboard screen reads from a small store (`src/dashboard/*Store.js`) that pages subscribe to via `useSyncExternalStore`. Stores whose endpoints are live are hydrated from the API by `DashboardLayout` on mount; the rest hold local mock data until their endpoints ship. The full contract, screen by screen, is in [`docs/backend-api.md`](docs/backend-api.md).

| Module | Backend status |
|---|---|
| Auth, onboarding, business profile, policy, trust page | Live |
| Fleet | Wired in the client, awaiting backend deploy |
| Bookings, clients, verification, payments, staff, notifications, billing, support | Local stores, endpoints pending |

The API client (`src/lib/api.js`) handles bearer tokens, single-flight refresh on 401, and FastAPI-style `{ detail }` error messages surfaced as toasts.

### Product notes

- **Pricing:** KES 400 per vehicle per month (KES 200 launch price for the first 3 months), KES 2,000 monthly minimum, unlimited bookings and staff. Renter identity checks are pay-as-you-go at KES 100 per check from a prepaid wallet.
- **Verification:** renter KYC runs through Dojah, proxied by the backend so keys never reach the browser.
- **Payments:** renters pay via M-Pesa STK push; businesses pay Ardena through Paystack.
- **PDFs:** rental agreements and monthly vehicle statements are generated client-side with jsPDF, lazily imported to keep the main bundle lean.

## Conventions

- Plain CSS, one stylesheet per feature area, kept next to the components.
- Blue `#007FFA` is used only as a small accent; sections alternate white and black; corners are sharp. Check ardena.co.ke for the reference look.
- No em dashes in UI copy (enforced by `node scripts/remove-dashes.mjs`).
- Money is integer KES, dates are ISO 8601 at the API boundary and display strings ("12 Aug 2026") in the UI.

## Deployment

Deployed on Vercel as a static SPA; `vercel.json` rewrites all routes to `index.html` so deep links work.
