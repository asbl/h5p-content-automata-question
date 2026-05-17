import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@scripts': path.resolve(__dirname, '../H5P.CodeQuestion-6.0/src/scripts'),
      '@services': path.resolve(__dirname, '../H5P.CodeQuestion-6.0/src/scripts/services'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
});
