# JARRO — Women's Clothing Storefront

A React + TypeScript storefront for JARRO ("Real Fits, Real You"), a
Bangladesh-based women's clothing brand (kurtis, 3-piece sets, co-ords,
ponchos, and bangles — see facebook.com/Jarrobd). This is a rebrand/clone of
the Valent & Co. codebase, retargeted at JARRO's product line. Product
catalogue and orders are backed by AWS DynamoDB; admin login is backed by AWS
Cognito; admin-uploaded product photos are backed by AWS S3. Cart and
wishlist are kept client-side (per-visitor, in `localStorage`).

> **Status:** Live on AWS Amplify Hosting at
> `https://main.d2u0llr91rm89j.amplifyapp.com`, connected to this repo's
> `main` branch (auto-builds on every push). Backend (DynamoDB, Cognito, S3)
> is fully provisioned and verified live — see [Infrastructure](#infrastructure).

## Stack

- React 19 + TypeScript, built with Vite 6
- Tailwind CSS v4
- AWS DynamoDB (products + orders), via the AWS SDK v3 (`@aws-sdk/lib-dynamodb`)
- AWS Cognito User Pool (admin auth) + Identity Pool (temporary, scoped IAM credentials)
- AWS S3 (admin-uploaded product photos), via `@aws-sdk/client-s3`
- AWS Amplify Hosting (build + deploy) — connected to GitHub, auto-builds on push to `main`

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
(read-only) — useful for UI-only work, but cart checkout, admin login, order
lookup, and product image upload all require a real AWS backend.

## Environment variables

All variables are consumed at build time via `import.meta.env` (Vite), so
they must be set both locally (`.env`) and in the hosting environment
(Amplify Hosting → App settings → Environment variables). **Any change to
these in the Amplify console only takes effect on the next build/redeploy**
— Amplify does not hot-reload a running deployment when you edit them.

| Variable | Description |
|---|---|
| `VITE_AWS_REGION` | AWS region the backend resources live in (`us-east-1`) |
| `VITE_IDENTITY_POOL_ID` | Cognito Identity Pool ID — issues scoped guest/admin IAM credentials |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID — admin accounts |
| `VITE_COGNITO_CLIENT_ID` | Cognito User Pool **app client** ID (no client secret) |
| `VITE_DDB_PRODUCTS_TABLE` | DynamoDB table name for products |
| `VITE_DDB_ORDERS_TABLE` | DynamoDB table name for orders |
| `VITE_S3_PRODUCT_IMAGES_BUCKET` | S3 bucket for admin-uploaded product photos |

See `.env.example` for a template.

## Product image uploads (admin)

The admin "Add/Edit Product" form (Products tab) uploads photos directly
from the browser to S3 using the signed-in admin's temporary Cognito
credentials — no server or Lambda involved. Multiple photos per product are
supported (the first is the storefront "cover" image); pasting an existing
image URL is still available as a fallback. Uploaded files are validated
client-side (JPEG/PNG/WebP/GIF, max 8 MB) before upload, and deleting a
product best-effort deletes its uploaded photos from S3 too (pasted external
URLs and the bundled placeholder are left alone, since those aren't ours to
delete).

See `src/lib/s3.ts` for the upload/delete implementation.

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
  `JARRO-AdminRole` (full read/write on both DynamoDB tables, plus
  `s3:PutObject`/`s3:DeleteObject` on the product images bucket's
  `products/` prefix — only assumable with a valid admin ID token)
- **S3** — `jarro-bd-product-images`, public read on the `products/` prefix
  only (bucket policy; ACL-based public access is blocked account-wide),
  CORS enabled for browser `PUT`/`GET`/`HEAD`
- **Amplify Hosting** — app `jarro-bd` (`d2u0llr91rm89j`), connected to this
  GitHub repo's `main` branch, auto-builds on push. A second, unconnected
  Amplify app (also confusingly named "JARRO") existed briefly during setup
  and has been deleted — this repo's `jarro-bd` app is the only one that
  matters.

## Deploying & rolling back

Every push to `main` auto-builds and deploys via the Amplify↔GitHub webhook
— there's no separate deploy step. If a bad deploy needs to be undone:

1. AWS Console → Amplify → app `jarro-bd` → branch `main` → **Deployments**.
2. Find the last known-good build in the list and choose **Redeploy this
   version** (this re-runs that exact build's artifacts — it does not
   re-run `npm install`/`npm run build`, so it's fast and can't pick up an
   unrelated dependency change).
3. This does **not** revert the Git history — `main` still has the bad
   commit on top. Follow up with a proper `git revert` (or a fix-forward
   commit) once you're not under time pressure, so the next push doesn't
   silently re-deploy the same bug.

Environment variable changes (App settings → Environment variables) only
take effect on the *next* build — editing them there doesn't touch what's
currently live. Either push a commit or use **Redeploy this version →
Redeploy with existing artifacts** is not sufficient for an env var change
specifically; use the **Actions → Run build** option (or push an empty
commit) to force a fresh build that actually picks up the new values.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build (`dist/`)
- `npm run preview` — preview a production build locally
- `npm run typecheck` — TypeScript typecheck (`tsc --noEmit`)
- `npm run lint` — ESLint
- `npm run test` — unit tests (Vitest)

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
