/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5035',
        changeOrigin: true,
      },
      '/weatherforecast': {
        target: 'http://localhost:5035',
        changeOrigin: true,
      },
      // OpenAPI document (Development only), used by the Backend status page.
      '/openapi': {
        target: 'http://localhost:5035',
        changeOrigin: true,
      },
    },
  },
})
