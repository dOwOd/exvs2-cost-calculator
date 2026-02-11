import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.astro', 'src/**/*.tsx'],
    },
  },
});
