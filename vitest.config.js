import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          url: 'http://localhost/',
        },
      },
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
      setupFiles: ['./src/test/setupTests.js'],
      clearMocks: true,
      restoreMocks: true,
      mockReset: true,
    },
  })
);
