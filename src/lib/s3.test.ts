import { describe, expect, it } from 'vitest';
import { imageUploadIsConfigured, uploadProductImage, deleteProductImage } from './s3';

// These tests run with no VITE_S3_PRODUCT_IMAGES_BUCKET (or other VITE_AWS_*)
// env vars set — see vitest.config.ts — so imageUploadIsConfigured is false.
// That's intentional, matching ShopContext.test.tsx's philosophy: it
// exercises the real "not configured" guard clause without ever touching
// the actual S3 SDK or network, and specifically guards against the guard
// clause itself silently disappearing (e.g. if a future refactor moved the
// config check after the file-validation checks, or dropped it entirely,
// an upload attempt in an unconfigured build would throw a much more
// confusing SDK-level error deep inside client.send() instead of this
// clear, early message).

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('imageUploadIsConfigured', () => {
  it('is false when no S3/AWS env vars are set (this test environment)', () => {
    expect(imageUploadIsConfigured).toBe(false);
  });
});

describe('uploadProductImage', () => {
  it('throws a clear "not configured" error before attempting any upload', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024);
    await expect(uploadProductImage('fake-id-token', file)).rejects.toThrow(
      /not configured/i
    );
  });
});

describe('deleteProductImage', () => {
  it('resolves without throwing when not configured (best-effort no-op)', async () => {
    await expect(
      deleteProductImage('fake-id-token', 'https://example.com/products/some-image.jpg')
    ).resolves.toBeUndefined();
  });
});
