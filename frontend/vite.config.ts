import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/edl-cnsc/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Cambia esto si tu backend corre en otro puerto:
        // XAMPP con PHP integrado: http://localhost:8000
        // Apache directamente: http://localhost/edl-cnsc/backend/public
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
