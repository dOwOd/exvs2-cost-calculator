import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
  test: {
    globals: true,
    include: [
      '**/__tests__/**/*.{ts,tsx}',
      '**/?(*.)+(spec|test).{ts,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.astro', 'src/**/*.tsx'],
    },
  },
});
