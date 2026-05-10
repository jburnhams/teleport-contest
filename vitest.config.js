import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['js/**/*.js'],
      exclude: ['js/isaac64.js', 'js/terminal.js', 'js/storage.js'], // Frozen files
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 90,
        branches: 60,
        functions: 50,
        lines: 90,
      },
    },
  },
});
