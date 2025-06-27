// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/runs': 'http://localhost:5000',
      '/runs/': 'http://localhost:5000', // for nested routes
      '/data': 'http://localhost:5000'    // if you serve videos under /data
    }
  }
})
