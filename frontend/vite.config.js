import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'src/pages',
  publicDir: resolve(__dirname, 'public'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      input: {
        index:     resolve(__dirname, 'src/pages/index.html'),
        register:  resolve(__dirname, 'src/pages/RegisterScreen.html'),
        dashboard: resolve(__dirname, 'src/pages/Dashboard.html'),
        sheet:     resolve(__dirname, 'src/pages/Sheet.html'),
      },
    },
  },
  server: {
    port: 5500,
    host: true,
    open: '/index.html',
  },
  preview: {
    port: 5500,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
