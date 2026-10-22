// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    // Pool 'vmThreads': crea un worker por archivo, pero reutiliza el entorno
    // jsdom entre archivos del mismo worker. Mantiene aislamiento por archivo
    // y reduce el tiempo de creación de entornos (~44 jsdom → ~8).
    pool: 'vmThreads',
    env: {
      VITE_API_URL: 'http://localhost:8000/api',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'src/test/**',
        'src/main.jsx',
        'src/App.jsx',
        '**/*.css',
        '**/*.d.ts',
      ],
    },
  },
});