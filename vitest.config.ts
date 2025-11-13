import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 10000,
    // Exclude node_modules except for test files
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  optimizeDeps: {
    exclude: ['@bigcommerce/translations-graphql-client', '@bigcommerce/translations-auth-client', '@bigcommerce/translations-rest-client'],
  },
  // Handle local packages
  ssr: {
    noExternal: ['@bigcommerce/translations-graphql-client', '@bigcommerce/translations-auth-client', '@bigcommerce/translations-rest-client'],
  },
});

