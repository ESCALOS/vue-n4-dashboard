import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000'

  const apiProxy = {
    '/api': {
      target: backendTarget,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  }

  return {
    plugins: [vue()],
    server: {
      proxy: apiProxy,
    },
    preview: {
      port: 8080,
      proxy: apiProxy,
      allowedHosts: ['massive-daily-mongoose.ngrok-free.app']
    },
    build: {
      // Optimizaciones de bundling
      rollupOptions: {
        output: {
          // Manual chunks para mejorar caching y paralelización de descargas
          manualChunks: {
            // Librerías de estado (pequeñas)
            'vue-core': ['vue', 'vue-router', 'pinia'],
          },
        }
      },
      // Reducir tamaño del chunk de estado reportado
      chunkSizeWarningLimit: 600,
    },
  }
})
