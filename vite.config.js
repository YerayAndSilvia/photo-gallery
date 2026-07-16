import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Cambia 'photo-gallery' por el nombre exacto de tu repositorio en GitHub
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/photo-gallery/',
})
