import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  preview: {
    port: 5173,
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    target: 'es2022',
    cssMinify: true,
    sourcemap: true,
    // Chunks manuais: separa libs grandes do bundle das pages pra que mudancas em
    // codigo de aplicacao nao invalidem o cache dos vendors. Cada chunk fica
    // cacheavel separadamente no browser. Combinado com lazy routes (router.tsx),
    // o initial load baixa so o chunk da rota '/' (login) + vendor compartilhado.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'tanstack': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'animation': ['framer-motion', 'motion', 'canvas-confetti'],
        },
      },
    },
  },
});
