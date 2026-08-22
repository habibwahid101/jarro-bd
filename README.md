# JARRO — Women's Clothing Storefront

A React + TypeScript storefront for JARRO ("Real Fits, Real You"), a
Bangladesh-based women's clothing brand (kurtis, 3-piece sets, co-ords,
ponchos, and bangles — see facebook.com/Jarrobd). This is a rebrand/clone of
the Valent & Co. codebase, retargeted at JARRO's product line. Product
catalogue and orders are backed by AWS DynamoDB; admin login is backed by AWS
Cognito. Cart and wishlist are kept client-side (per-visitor, in
`localStorage`).

> **Backend status:** JARRO now has its own AWS resources, fully separate
> from Valent & Co.'s — see [Infrastructure](#infrastructure) below. `.env`
> on this machine is already pointed at them (not committed to git — see
> `.gitignore`). The Products table has been seeded with the 10 sample items
> from `mockData.ts`; the Orders table starts empty. Amplify Hosting has not
> been set up yet — this is currently backend-only (DynamoDB + Cognito),
> deploy separately whenever you're ready.

## Stack

- React 19 + TypeScript, built with Vite 6
- Tailwind CSS v4
- AWS DynamoDB (products + orders), via the AWS SDK v3 (`@aws-sdk/lib-dynamodb`)
- AWS Cognito User Pool (admin auth) + Identity Pool (temporary, scoped IAM credentials)
- AWS Amplify Hosting (build + deploy) — not yet set up for JARRO, see [Infrastructure](#infrastructure)

## Prerequisites

- Node.js 18+
- An AWS account with the resources described in [Infrastructure](#infrastructure) below

## Run locally

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values for your AWS
   environment (see [Environment variables](#environment-variables)).
3. Start the dev server:
   ```
   npm run dev
   ```

Without a valid `.env`, the app still runs using bundled demo product data
(read-only) — useful for UI-only work, but cart checkout, admin login, and
order lookup all require a real AWS backend.

## Environment variables

All variables are consumed at build time via `import.meta.env` (Vite), so
they must be set both locally (`.env`) and in the hosting environment
(Amplify Hosting → App settings → Environment variables).

| Variable | Description |
|---|---|
| `VITE_AWS_REGION` | AWS region the backend resources live in (e.g. `us-east-1`) |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID — issues scoped guest/admin IAM credentials |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID — admin accounts |
| `VITE_COGNITO_CLIENT_ID` | Cognito User Pool **app client** ID (no client secret) |
| `VITE_DDB_PRODUCTS_TABLE` | DynamoDB table name for products |
| `VITE_DDB_ORDERS_TABLE` | DynamoDB table name for orders |

See `.env.example` for a template.

## Infrastructure

Provisioned in AWS (region `us-east-1`), separate from Valent & Co.'s own
resources — nothing here is shared with that project:

- **DynamoDB** — `JARRO-Products`, `JARRO-Orders` (with `orderNumber-index`
  and `customerMobile-index` GSIs on Orders), both on-demand billing
- **Cognito User Pool** — `JARRO-AdminPool` (`us-east-1_4MANSDm5m`), app client
  `jarro-web` (no secret, `USER_PASSWORD_AUTH` + SRP enabled, no OAuth flows)
- **Cognito Identity Pool** — `JarroIdentityPool` (`us-east-1:fe33ac71-157e-48bd-88f4-d42fe6c282f0`),
  issues two IAM roles via unauthenticated/authenticated federation:
  `JARRO-GuestRole` (read products; create + look up own orders only) and
  `JARRO-AdminRole` (full read/write on both tables, only assumable with a
  valid admin ID token)
- **Amplify Hosting** — not yet provisioned. Deploying JARRO (Amplify, Vercel,
  or otherwise) is a separate step from the backend above.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build (`dist/`)
- `npm run preview` — preview a production build locally
- `npm run lint` — TypeScript typecheck (`tsc --noEmit`); there is no separate
  ESLint config in this project yet

## Admin access

The admin panel (`/` → Admin) is gated behind Cognito sign-in
(`src/components/AdminGate.tsx`). A first admin account already exists in
`JARRO-AdminPool` — see the credentials shared with you separately (not
recorded in this repo). Create additional admin users in the Cognito User
Pool console. **Change the password after first login** — there is currently
no in-app change-password flow, so do this via the Cognito console or
`aws cognito-idp admin-set-user-password`.

## Project status

See [`docs/PROJECT_STATUS_AND_COMPLETION_PLAN.md`](docs/PROJECT_STATUS_AND_COMPLETION_PLAN.md)
for the current audit, known gaps, and the completion backlog.
