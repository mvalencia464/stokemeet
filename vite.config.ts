import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/fathom': {
          target: 'https://api.fathom.ai/external/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fathom/, ''),
        },
        '/api/oembed': {
          target: 'https://fathom.video',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/oembed/, '/oembed'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
