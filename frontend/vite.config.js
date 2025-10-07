import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // The 'server' object must be at the top level, not inside 'resolve'
  server: {
    proxy: {
      '/api': {
        // The target MUST point to your backend server's port
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // The 'resolve' object is separate from 'server'
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})