import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Optimizaciones de bundling
    rollupOptions: {
      output: {
        // Manual chunks para mejorar caching y paralelización de descargas
        manualChunks: {
          // Librerías de estado (pequeñas)
          'vue-core': ['vue', 'vue-router', 'pinia'],
        }
      }
    },
    // Reducir tamaño del chunk de estado reportado
    chunkSizeWarningLimit: 600
  },
  preview: {
    port: 8080
  }
})
