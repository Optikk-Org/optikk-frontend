import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import {
  API_PROXY_BASE,
  DEV_BACKEND_URL,
  DEV_FRONTEND_PORT,
} from './src/config/apiConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devBackendUrl = env.VITE_DEV_BACKEND_URL || DEV_BACKEND_URL;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@features': path.resolve(__dirname, './src/features'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@config': path.resolve(__dirname, './src/config'),
        '@components': path.resolve(__dirname, './src/shared/components'),
        '@hooks': path.resolve(__dirname, './src/shared/hooks'),
        '@utils': path.resolve(__dirname, './src/shared/utils'),
        '@services': path.resolve(__dirname, './src/shared/api'),
        '@store': path.resolve(__dirname, './src/store'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/hooks': path.resolve(__dirname, './src/shared/hooks'),
      },
    },
    server: {
      port: DEV_FRONTEND_PORT,
      proxy: {
        [API_PROXY_BASE]: {
          target: devBackendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'echart-vendor': ['echarts', 'echarts-for-react'],
            'query-vendor': ['@tanstack/react-query', 'axios'],
          },
        },
      }
    },
  };
});
