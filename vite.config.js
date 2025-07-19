import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // ✅ Correct for Vercel (served from root)
  plugins: [react()],
})
