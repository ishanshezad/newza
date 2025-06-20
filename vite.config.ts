import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/functions/v1': {
        target: 'http://localhost:54327',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});