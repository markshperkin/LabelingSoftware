import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/runs': 'http://localhost:5000',
      '/runs/': 'http://localhost:5000',
      '/data': 'http://localhost:5000'
    }
  }
})
