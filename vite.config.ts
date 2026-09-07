import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Membuka akses jaringan lokal (LAN / Wi-Fi)
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
})
