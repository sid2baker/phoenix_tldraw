import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../priv/static',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173
    }
  }
})
