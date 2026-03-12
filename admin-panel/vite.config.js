import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../',
  base: '/admin-panel/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor':    ['react-bootstrap'],
          'icons-vendor': ['react-bootstrap-icons'],
          'utils-vendor': ['axios', 'aos'],
        }
      }
    }
  }
})