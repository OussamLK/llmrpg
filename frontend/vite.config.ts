import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backendAddress = process.env.BACKEND_ADDRESS || "http://localhost:3000"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      '/api': {
        target: backendAddress,
        changeOrigin: true,
        rewrite: path=>path.replace(/^\/api/, '')
      }
    }
  }
})
