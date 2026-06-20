import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deploys to: https://smileygz.github.io/Bazarito-cancun/
  // This ensures all asset paths (JS, CSS, images) resolve correctly.
  base: '/',
})
