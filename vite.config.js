import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['animejs'],
    esbuildOptions: {
      mainFields: ['main', 'module']
    }
  },
  resolve: {
    alias: {
      'animejs': path.resolve(__dirname, 'node_modules/animejs/lib/anime.cjs')
    }
  }
})
