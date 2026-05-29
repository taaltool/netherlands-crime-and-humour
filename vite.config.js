import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/netherlands-crime-and-humour/",
  root: './',
  publicDir: './public',
  server: {
    hmr: false,
  },
  build: {
    outDir: './dist',
    modulePreload: false,
  },
  plugins: [react()],
});
