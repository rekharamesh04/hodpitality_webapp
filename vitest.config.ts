import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests for the parts of the app that are plain functions — the industry
 * vocabulary, role labels, badge tones and navigation filtering.
 *
 * Deliberately no DOM environment: these are the rules that decide what every
 * screen says, and they are worth testing on their own, without the cost and
 * flakiness of rendering React to assert on a string.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
