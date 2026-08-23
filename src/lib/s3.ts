/**
 * S3 client wiring for JARRO product image uploads. Uses the same Cognito
 * Identity Pool credential pattern as aws.ts, but always with an admin
 * idToken — only signed-in admins can write images (see IAM policy
 * "JARRO-AdminS3ProductImages" on JARRO-AdminRole, scoped to the
 * `products/*` prefix of this bucket only).
 *
 * Uploaded images are publicly readable (bucket policy grants anonymous
 * s3:GetObject on `products/*`) so they can be used directly as <img src>
 * on the public storefront, exactly like the seeded demo images.
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { REGION, IDENTITY_POOL_ID, USER_POOL_ID } from './aws';

export const PRODUCT_IMAGES_BUCKET = import.meta.env.VITE_S3_PRODUCT_IMAGES_BUCKET as string;

export const imageUploadIsConfigured = Boolean(
  REGION && IDENTITY_POOL_ID && USER_POOL_ID && PRODUCT_IMAGES_BUCKET
);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function buildS3Client(idToken: string): S3Client {
  const credentials = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
    logins: { [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken },
  });
  return new S3Client({ region: REGION, credentials });
}

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop();
  if (fromName && /^[a-zA-Z0-9]{1,5}$/.test(fromName)) return fromName.toLowerCase();
  const fromType = file.type.split('/').pop();
  return fromType ? fromType.toLowerCase() : 'jpg';
}

/**
 * Uploads a single product image to S3 under `products/` and returns its
 * public URL. Requires an admin idToken (the caller — ShopContext — only
 * ever invokes this with a signed-in admin session).
 */
export async function uploadProductImage(idToken: string, file: File): Promise<string> {
  if (!imageUploadIsConfigured) {
    throw new Error(
      'Image upload is not configured for this build (missing VITE_S3_PRODUCT_IMAGES_BUCKET or AWS env vars).'
    );
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPEG, PNG, WebP, or GIF image.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large (max 8 MB). Please choose a smaller file.');
  }

  const key = `products/${crypto.randomUUID()}.${extensionFor(file)}`;
  const client = buildS3Client(idToken);
  const body = new Uint8Array(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: PRODUCT_IMAGES_BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type,
    })
  );

  return `https://${PRODUCT_IMAGES_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Deletes a previously-uploaded product image, given its public URL.
 * Silently no-ops for URLs that aren't from this bucket (e.g. an
 * externally-pasted image URL, or the bundled placeholder) since those
 * were never ours to delete.
 */
export async function deleteProductImage(idToken: string, url: string): Promise<void> {
  if (!imageUploadIsConfigured) return;
  const prefix = `https://${PRODUCT_IMAGES_BUCKET}.s3.${REGION}.amazonaws.com/`;
  if (!url.startsWith(prefix)) return;

  const key = url.slice(prefix.length);
  const client = buildS3Client(idToken);
  try {
    await client.send(new DeleteObjectCommand({ Bucket: PRODUCT_IMAGES_BUCKET, Key: key }));
  } catch (err) {
    // Best-effort cleanup — a failed delete (e.g. the object was already
    // removed, or a transient network error) shouldn't block whatever
    // product edit the caller is trying to complete.
    console.error('Failed to delete product image from S3.', err);
  }
}
