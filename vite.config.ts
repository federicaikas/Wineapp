import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Esponi su localhost e rete locale (IP) per mobile testing
  },
  css: {
    devSourcemap: true, // Source maps per i CSS
  },
  build: {
    sourcemap: true, // Source maps per TypeScript e JavaScript
  },
})
