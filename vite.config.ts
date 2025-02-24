import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,svelte}'],
    exclude: ['e2e/**/*', 'tests/e2e/**/*'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['@testing-library/svelte']
        }
      }
    }
  }
});