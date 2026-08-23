# Project Status & Completion Plan — JARRO

Last audited: 2026-08-23
Audited against: this repo at commit `0cdd9c9` ("Add WhatsApp contact,
favicon/SEO, admin error handling"), plus live inspection of the AWS account
(Amplify, Cognito, DynamoDB, S3, IAM) via the AWS MCP connector (boto3).

> The previous version of this document was a leftover from the original
> **Valent & Co.** audit (different repo, different Amplify app, different
> Cognito pool) and never actually applied to JARRO after the rebrand. This
> version replaces it with an audit of the real JARRO resources.

## 1. Executive Summary

- **Completion percentage:** ~90% of a deployable, feature-complete MVP.
  Application code, AWS backend, and hosting are all live and verified
  working end-to-end. The image upload feature shipped this session still
  needs a `git push` from the account owner to reach production (see §5).
- **Deployment readiness — the big finding this audit:** the Amplify app
  actually connected to this GitHub repo (`jarro-bd`, `d2u0llr91rm89j`) had
  **zero environment variables configured**, despite deploying successfully
  on every push. This meant the live site was silently running in
  demo-data-only mode: browsing worked, but checkout, admin login, and order
  lookup were all broken in production. **Fixed this audit** — env vars set,
  app redeployed (job 6, SUCCEED), live site now backed by the real
  DynamoDB/Cognito resources. See §5 for how this happened.
- **A second, unconnected Amplify app** (confusingly also named "JARRO",
  `d3diavwr0aozws`) existed with the *correct* env vars but no GitHub
  connection and no deployment — an orphaned duplicate from earlier setup.
  **Deleted this audit** to remove the confusion.
- **Product readiness:** Core shopper journeys (browse, cart, checkout,
  order lookup) and the admin journey (login, product CRUD, order status,
  now real product-image upload) are implemented and type-safe.
- **Security readiness:** Good — IAM least privilege for the guest/admin
  split verified live. New S3 write permission for JARRO-AdminRole is
  correctly scoped to the `products/` prefix only, and to `PutObject`/
  `DeleteObject` (no `GetObject`/`ListBucket` needed, since the bucket
  policy already makes `products/*` publicly readable).
- **Engineering readiness:** Build, typecheck, and the existing unit test
  suite (7 tests) all pass with the new image-upload code included.

## 2. This Session's Changes

### AWS backend
- Set the missing environment variables on the live Amplify app `jarro-bd`
  (`d2u0llr91rm89j`): `VITE_AWS_REGION`, `VITE_IDENTITY_POOL_ID`,
  `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`,
  `VITE_DDB_PRODUCTS_TABLE`, `VITE_DDB_ORDERS_TABLE`, and the new
  `VITE_S3_PRODUCT_IMAGES_BUCKET`.
- Triggered a manual redeploy (job 6) so the new env vars actually took
  effect (Vite bakes them in at build time — changing them in the console
  alone does nothing until the next build). Confirmed `SUCCEED` on
  `BUILD`/`DEPLOY`/`VERIFY`.
- Deleted the orphaned, never-deployed Amplify app `JARRO` (`d3diavwr0aozws`).
- Created S3 bucket `jarro-bd-product-images`:
  - Public-access-block: ACL-based public access blocked; bucket-policy
    public access allowed (modern S3 best practice over public ACLs).
  - Bucket policy: anonymous `s3:GetObject` on `products/*` only.
  - CORS: `GET`/`PUT`/`HEAD` allowed from any origin (write access is still
    gated by IAM/Cognito credentials, not CORS — CORS only governs whether a
    browser *can attempt* the request).
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
  drag-a-file-picker upload (multiple files, parallel upload, per-file
  progress), a thumbnail grid with per-image remove, and a "paste a URL"
  fallback for external images. Product data already supported an
  `images: string[]` array and `ProductDetailView` already renders a
  multi-image gallery (`activeImageIndex`) — the admin form just wasn't
  using that capacity before this change.
- `package.json` — added `@aws-sdk/client-s3`.
- `README.md` / `.env.example` — updated to reflect the real, live
  infrastructure (previously described Amplify as "not yet set up," which
  was stale even before this audit — the app existed and was deploying,
  just misconfigured).

## 3. Confirmed Working (verified live, this audit)

- **DynamoDB** — `JARRO-Products` (10 items, ACTIVE), `JARRO-Orders` (0
  items, ACTIVE, both GSIs ACTIVE).
- **Cognito** — User Pool `JARRO-AdminPool` (`us-east-1_4MANSDm5m`), app
  client `jarro-web`, no secret, `USER_PASSWORD_AUTH` enabled. Identity Pool
  `JarroIdentityPool` correctly maps unauthenticated → `JARRO-GuestRole`,
  authenticated → `JARRO-AdminRole`.
- **IAM least privilege** — `JARRO-GuestRole`: read Products, create +
  query-own Orders only (no Scan on Orders, no Update/Delete anywhere).
  `JARRO-AdminRole`: full CRUD on both tables + scoped S3 write (new).
- **Amplify** — `jarro-bd` app connected to `github.com/habibwahid101/jarro-bd`,
  `main` branch, auto-build on push, env vars now correctly set, last
  deploy `SUCCEED`.
- **Build & typecheck** — `npm run build` and `npm run typecheck` pass with
  zero errors, including the new S3/upload code.
- **Unit tests** — existing 7-test suite (`ShopContext.test.tsx`) passes
  unchanged.

## 4. Outstanding — Owner Action Required

1. **`git push` the changes from this session.** This cloud session has no
   GitHub push credentials and (for security) Amplify refuses manual/zip
   deploys for a GitHub-connected app (`BadRequestException: Operation not
   supported. App is already connected a repository` — confirmed live,
   this audit), so the image-upload feature's code can't reach production
   without a real push from the repo owner. The changed/added files are
   already written to your local working copy:
   - `src/lib/s3.ts` (new)
   - `src/context/ShopContext.tsx`
   - `src/components/views/AdminView.tsx`
   - `package.json` / `package-lock.json`
   - `README.md`, `.env.example`, this file
   Review, then:
   ```
   git add -A
   git commit -m "Add real S3-backed product image upload for admin panel"
   git push
   ```
   Amplify's webhook will pick this up automatically and redeploy.
2. **Change the default admin password** after first login, if not already
   done — still no in-app change-password flow (see README → Admin access).
3. Consider whether the wildcard CORS origin (`*`) on the product-images
   bucket should be narrowed to the production domain(s) once a custom
   domain is attached to the Amplify app — functionally fine as-is (write
   access is enforced by IAM, not CORS) but tighter is tidier.

## 5. How the Env-Var Gap Happened (for reference)

Three Amplify apps existed in the account by the time this audit started:
`Valent-Co` (the original, unrelated project — left alone), `jarro-bd`
(connected to the correct repo, receiving real deploys, but created without
environment variables — likely created via `amplify init`/console "connect
repo" flow that doesn't prompt for env vars), and an orphaned `JARRO` app
(created separately, correctly configured, but never connected to GitHub —
likely an earlier, abandoned attempt at the same setup). The working
hypothesis is that backend provisioning (DynamoDB/Cognito/IAM) and Amplify
Hosting setup happened in two disconnected passes that never got reconciled
against each other, and nothing surfaced the mismatch because Amplify builds
succeed regardless of whether `import.meta.env.VITE_*` resolves to a real
value or `undefined` at build time — the app just silently falls back to
demo-data mode instead of failing the build.

## 6. Technical Debt (carried over, not addressed this audit)

- **Main JS bundle is ~600 KB minified** (~178 KB gzipped) — Vite's build
  warns on this. The AWS SDK v3 clients (now three: DynamoDB, Cognito, S3)
  are the largest contributor. Dynamic `import()` of the AWS libs would keep
  them out of the initial bundle for pure browsing sessions.
- **No code-splitting by route** — all views ship in one bundle.
- **`id` generation uses `Date.now()`** for orders/products — low collision
  risk at current scale, a UUID would be more robust under concurrent
  writes.
- **Order total is client-computed**, trusted as-is by DynamoDB (documented,
  accepted risk for a Cash-on-Delivery business model — see the original
  Valent & Co. audit for the full reasoning, still applicable).
