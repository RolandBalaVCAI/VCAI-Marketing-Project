import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
          'chart-vendor': ['recharts'],
          
          // App chunks
          'utils': [
            './src/utils/calculations.js',
            './src/utils/chartHelpers.js',
            './src/utils/csvExport.js',
            './src/utils/dateHelpers.js'
          ],
          'stores': [
            './src/stores/campaignsStore.js',
            './src/stores/filtersStore.js',
            './src/stores/uiStore.js'
          ],
          'hooks': [
            './src/hooks/useCampaigns.js',
            './src/hooks/useFilters.js',
            './src/hooks/useCampaignData.js'
          ],
          'components-common': [
            './src/components/common/ErrorBoundary.jsx',
            './src/components/common/Button.jsx',
            './src/components/common/Modal.jsx'
          ]
        }
      }
    },
    // Set chunk size warning limit to 600KB (from default 500KB)
    chunkSizeWarningLimit: 600,
    
    // Enable source maps for production debugging
    sourcemap: true,
    
    // Minification settings
    minify: 'esbuild',
    target: 'es2015'
  },
  
  // Development optimizations
  server: {
    hmr: {
      overlay: true
    }
  },
  
  // Enable tree shaking
  define: {
    __DEV__: JSON.stringify(false)
  }
})
