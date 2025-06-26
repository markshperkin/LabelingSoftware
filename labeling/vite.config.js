// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload':  'http://localhost:5000',
      '/labels':  'http://localhost:5000',
      '/uploads': 'http://localhost:5000'   // ← add this line
    }
  }
})
