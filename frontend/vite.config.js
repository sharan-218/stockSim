import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    allowedHosts:["https://stocksim-4zqk.onrender.com","http://localhost:8000"],
  }
})
