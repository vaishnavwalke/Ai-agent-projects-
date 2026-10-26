import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub project Pages: https://vaishnavwalke.github.io/Ai-agent-projects-/
  base: '/Ai-agent-projects-/',
  plugins: [react()],
})
