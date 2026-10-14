   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     base: '/tg-shopping-list/',
     build: {
       outDir: 'dist',
       sourcemap: false,
     },
   });