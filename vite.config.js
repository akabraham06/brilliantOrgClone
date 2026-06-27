import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    // Dev-only: forward AI proxy calls to the deployed Netlify Edge Function so
    // the browser hits a same-origin path (no CORS) while the secret key stays
    // server-side. Used with VITE_AI_PROXY_URL=/api/ai in .env.development.local.
    proxy: {
      '/api/ai': {
        target: 'https://brilliantorgclone.netlify.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
