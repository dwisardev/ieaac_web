import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../',
  base: '/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor':    ['bootstrap', 'react-bootstrap'],
          'icons-vendor': ['react-icons', 'react-bootstrap-icons', 'lucide-react'],
          'utils-vendor': ['axios', 'aos'],
        },
      },
    },
  },
})
