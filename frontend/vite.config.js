import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  
  // Optimisations de build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    
    // Réduire la taille du bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer tous les console.log
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.error']
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les librairies lourdes
          vendor: ['vue', 'vue-router', 'pinia'],
          mapbox: ['mapbox-gl'],
          three: ['three'],
          wavesurfer: ['wavesurfer.js'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    
    // Optimisations de chunks
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 3000,
    hmr: {
      overlay: false // Désactiver l'overlay d'erreur pour améliorer les performances
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  
  // Optimisations de résolution
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
