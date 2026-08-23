# Project Status & Completion Plan — JARRO

Last audited: 2026-08-23
Audited against: this repo at commit `238844b` ("Add real S3-backed product
image upload for admin panel"), plus live inspection of the AWS account
(Amplify, Cognito, DynamoDB, S3, IAM) via the AWS MCP connector (boto3).

> The previous version of this document was a leftover from the original
> **Valent & Co.** audit (different repo, different Amplify app, different
> Cognito pool) and never actually applied to JARRO after the rebrand. This
> version replaces it with an audit of the real JARRO resources, across two
> passes in the same day (§2 and §2b below).

## 1. Executive Summary

- **Completion percentage:** ~97% of a deployable, feature-complete MVP.
  Application code, AWS backend, and hosting are all live and verified
  working end-to-end, including the image-upload feature (confirmed live —
  Amplify job 7, `SUCCEED`). What's left (§4) is either a genuine owner
  decision (custom domain) or explicitly deferred alongside it (CORS/WAF
  tightening) — nothing is blocked on further engineering work.
- **The big finding, first pass:** the Amplify app actually connected to
  this GitHub repo (`jarro-bd`, `d2u0llr91rm89j`) had **zero environment
  variables configured**, despite deploying successfully on every push. The
  live site was silently running in demo-data-only mode: browsing worked,
  but checkout, admin login, and order lookup were all broken in production.
  **Fixed** — env vars set, redeployed, confirmed live.
- **A second, unconnected Amplify app** (confusingly also named "JARRO",
  `d3diavwr0aozws`) existed with the *correct* env vars but no GitHub
  connection and no deployment — an orphaned duplicate. **Deleted.**
- **Product readiness:** Core shopper journeys (browse, cart, checkout,
  order lookup — including a distinct "not found" vs "connection error"
  state, already correctly implemented before this audit) and the admin
  journey (login, product CRUD, order status, real S3-backed product-image
  upload) are implemented, type-safe, and live.
- **Security readiness:** Good — IAM least privilege for the guest/admin
  split verified live. S3 write permission for `JARRO-AdminRole` is scoped
  to the `products/` prefix only, `PutObject`/`DeleteObject` alone. The
  default admin account's password has been rotated off its original
  setup-time value (see §4 for the new one, shared separately/in-session).
- **Engineering readiness:** Build, typecheck, ESLint (0 errors — pre-
  existing unused-import warnings only, unrelated to this work), and the
  full unit test suite (11 tests, up from 7) all pass.

## 2. First Pass — Getting the Live Site Actually Working

### AWS backend
- Set the missing environment variables on the live Amplify app `jarro-bd`
  (`d2u0llr91rm89j`): `VITE_AWS_REGION`, `VITE_IDENTITY_POOL_ID`,
  `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`,
  `VITE_DDB_PRODUCTS_TABLE`, `VITE_DDB_ORDERS_TABLE`, and the new
  `VITE_S3_PRODUCT_IMAGES_BUCKET`.
- Triggered a manual redeploy so the new env vars actually took effect (Vite
  bakes them in at build time — changing them in the console alone does
  nothing until the next build). Confirmed `SUCCEED`.
- Deleted the orphaned, never-deployed Amplify app `JARRO` (`d3diavwr0aozws`).
- Created S3 bucket `jarro-bd-product-images`:
  - Public-access-block: ACL-based public access blocked; bucket-policy
    public access allowed (modern S3 best practice over public ACLs).
  - Bucket policy: anonymous `s3:GetObject` on `products/*` only.
  - CORS: `GET`/`PUT`/`HEAD` allowed from any origin (write access is still
    gated by IAM/Cognito credentials, not CORS — CORS only governs whether a
    browser *can attempt* the request; see §4 for the plan to narrow this).
- Added inline IAM policy `JARRO-AdminS3ProductImages` to `JARRO-AdminRole`:
  `s3:PutObject` + `s3:DeleteObject` on `arn:aws:s3:::jarro-bd-product-images/products/*`.

### Application code
- `src/lib/s3.ts` (new) — S3 client using the same Cognito Identity Pool
  credential pattern as `src/lib/aws.ts`, always with an admin idToken.
  `uploadProductImage()` validates file type/size client-side, uploads to a
  UUID-named key under `products/`, returns the public URL.
  `deleteProductImage()` best-effort deletes, no-oping for any URL that
  isn't from this bucket.
- `src/context/ShopContext.tsx` — exposes `uploadProductImage` and
  `imageUploadConfigured` through the existing admin-action pattern (same
  shape as `addProduct`/`updateProduct`/etc.); `deleteProduct` now
  best-effort cleans up the deleted product's S3 images.
- `src/components/views/AdminView.tsx` — the "Add/Edit Product" form's
  single "Image URL" text field is replaced with a real upload widget:
  file-picker upload (multiple files, parallel upload, per-file progress),
  a thumbnail grid with per-image remove, and a "paste a URL" fallback for
  external images.
- `package.json` — added `@aws-sdk/client-s3`.
- `README.md` / `.env.example` — corrected to reflect the real, live
  infrastructure (previously described Amplify as "not yet set up," which
  was stale even before this pass — the app existed and was deploying, just
  misconfigured).

**Owner action taken:** this cloud session has no GitHub push credentials
(and Amplify correctly refuses manual/zip deploys for a GitHub-connected
app, by design), so the account owner reviewed and pushed these changes
themselves (`238844b`). Amplify's webhook picked it up automatically — job
7, `SUCCEED`, confirmed live.

## 2b. Second Pass — Closing Out the Remaining Backlog

- **Corrected two inaccuracies in this doc's first draft.** Route-level
  code-splitting (`React.lazy` per view in `App.tsx`) and a distinct
  "order not found" vs "connection error" state in `OrderLookupView` were
  **already implemented** before this audit even started (an earlier
  session's commit, "Add tests, ESLint, error boundary, code-splitting,
  order-lookup fix") — the first draft of this document listed both as
  outstanding without re-verifying against current code. They're fine;
  no action needed. A top-level `ErrorBoundary` is also already wired in
  `main.tsx`.
- **Investigated the main-bundle-size warning** (~600 KB minified) more
  carefully: adding `@aws-sdk/client-s3` grew the eager bundle by under
  1 KB, not the ~50-100 KB a fresh AWS SDK v3 client might suggest — the
  DynamoDB, Cognito, and S3 clients share most of their runtime (`@smithy/*`
  signing/HTTP/middleware code) once one is already bundled, so there was
  no meaningful win available from lazy-loading S3 specifically. The
  remaining size is essentially React + the DynamoDB/Cognito SDKs needed
  immediately on first paint (products load from DynamoDB on mount) — not
  fixable without a larger architecture change (e.g. server-rendering the
  initial product list), which isn't warranted at current traffic. Left as
  documented technical debt, not a bug.
- **Added test coverage for the new image-upload code** (11 tests total,
  up from 7): `src/lib/s3.test.ts` (new) verifies the upload/delete
  functions fail closed with a clear error when unconfigured, rather than
  attempting a network call or failing silently; `ShopContext.test.tsx`
  gained a test verifying `uploadProductImage` refuses to run without an
  active admin session. Also hardened `vitest.config.ts` to explicitly
  blank `VITE_S3_PRODUCT_IMAGES_BUCKET` in the test environment, matching
  the existing safety pattern for the other AWS env vars (so a test run can
  never accidentally hit the real bucket).
- **Documented the Amplify rollback procedure** in `README.md` (new
  "Deploying & rolling back" section) — there wasn't one before.
- **Rotated the admin account's password** off its original setup-time
  value via `AdminSetUserPassword` (permanent, no forced-change challenge).
  New credentials were shared directly with the account owner in
  conversation, not committed to this repo.
- **Rate limiting / AWS WAF — deliberately deferred, not forgotten.**
  Investigated attaching AWS WAF to the Amplify app for request-rate
  limiting. WAF Web ACLs attach to CloudFront/ALB/API Gateway/AppSync
  distributions; Amplify Hosting's *default* `amplifyapp.com` domain runs
  on AWS-managed, shared CloudFront infrastructure that isn't exposed for a
  WAF association. That capability opens up once a **custom domain** is
  attached (Amplify then provisions a dedicated distribution). Since the
  account owner has already said they'll add a custom domain later, WAF/
  rate-limiting is grouped into that same future step rather than attempted
  now against infrastructure that's about to change anyway. At current
  traffic this is low urgency (see the original risk write-up: a guest
  could theoretically script repeated `PutItem` calls with valid-but-public
  guest credentials, since those are necessarily exposed in a browser SPA —
  no customer data exposure, just noise/cost risk).

## 3. Confirmed Working (verified live)

- **DynamoDB** — `JARRO-Products` (10 items, ACTIVE), `JARRO-Orders` (ACTIVE,
  both GSIs ACTIVE).
- **Cognito** — User Pool `JARRO-AdminPool` (`us-east-1_4MANSDm5m`), app
  client `jarro-web`, no secret, `USER_PASSWORD_AUTH` enabled. Identity Pool
  `JarroIdentityPool` correctly maps unauthenticated → `JARRO-GuestRole`,
  authenticated → `JARRO-AdminRole`. Admin password rotated.
- **IAM least privilege** — `JARRO-GuestRole`: read Products, create +
  query-own Orders only (no Scan on Orders, no Update/Delete anywhere).
  `JARRO-AdminRole`: full CRUD on both tables + scoped S3 write.
- **Amplify** — `jarro-bd` app connected to `github.com/habibwahid101/jarro-bd`,
  `main` branch, auto-build on push, env vars correct, image-upload feature
  live (job 7, `SUCCEED`).
- **Build, typecheck, lint** — all pass with zero errors.
- **Unit tests** — 11/11 passing, including new S3/upload coverage.

## 4. Outstanding — Owner Decision, Not Blocked on Engineering

1. **Custom domain** — still on the `amplifyapp.com` subdomain by the
   owner's own choice ("will set up later"). Needs a domain name + registrar
   access when ready.
2. **Narrow the product-images bucket's CORS + attach WAF rate-limiting** —
   grouped with #1 above; both are most naturally done together once a
   custom domain (and its dedicated CloudFront distribution) exists.
3. Nothing else is outstanding from this audit.

## 5. How the Env-Var Gap Happened (for reference)

Three Amplify apps existed in the account at the start of the first pass:
`Valent-Co` (the original, unrelated project — left alone), `jarro-bd`
(connected to the correct repo, receiving real deploys, but created without
environment variables — likely via an `amplify init`/console "connect repo"
flow that doesn't prompt for env vars), and an orphaned `JARRO` app (created
separately, correctly configured, but never connected to GitHub — likely an
earlier, abandoned attempt at the same setup). Backend provisioning
(DynamoDB/Cognito/IAM) and Amplify Hosting setup appear to have happened in
two disconnected passes that never got reconciled, and nothing surfaced the
mismatch because Amplify builds succeed regardless of whether
`import.meta.env.VITE_*` resolves to a real value or `undefined` at build
time — the app just silently falls back to demo-data mode instead of
failing the build.

## 6. Technical Debt (accepted, not blocking)

- **Main JS bundle is ~600 KB minified** (~178 KB gzipped) — see §2b for
  why this isn't easily reducible further without a larger architecture
  change; not urgent at current traffic.
- **`id` generation uses `Date.now()`** for orders/products — low collision
  risk at current scale, a UUID would be more robust under concurrent
  writes.
- **Order total is client-computed**, trusted as-is by DynamoDB — accepted
  risk for a Cash-on-Delivery business model (a tampered total is caught on
  the phone-confirmation call before money changes hands). Would need a
  server-side (Lambda) recalculation step if the business ever accepts
  online prepayment.
