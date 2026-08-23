import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // IMPORTANT: point env loading at a directory with no .env file, and
  // explicitly blank every VITE_AWS_*/VITE_DDB_*/VITE_COGNITO_* var below.
  // Without this, Vite's normal env loading picks up the real `.env` in
  // this project root — which holds live AWS credentials — and the test
  // suite would silently start making real network calls against the
  // production Cognito/DynamoDB resources (a test run could even attempt
  // to write real-looking rows into the live Orders table). Tests must
  // always exercise the "AWS not configured" local-state fallback path,
  // never the real backend.
  envDir: path.resolve(__dirname, 'src/test'),
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    env: {
      VITE_AWS_REGION: '',
      VITE_IDENTITY_POOL_ID: '',
      VITE_COGNITO_USER_POOL_ID: '',
      VITE_COGNITO_CLIENT_ID: '',
      VITE_DDB_PRODUCTS_TABLE: '',
      VITE_DDB_ORDERS_TABLE: '',
      VITE_S3_PRODUCT_IMAGES_BUCKET: '',
    },
  },
});
