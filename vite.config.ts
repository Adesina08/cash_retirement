import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@features': '/src/features',
      '@lib': '/src/lib'
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
