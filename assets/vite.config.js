import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tidewave from "tidewave/vite-plugin";

export default defineConfig({
  plugins: [react(), tidewave()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "../priv/static/tldraw",
    emptyOutDir: true,
    manifest: false,
    rollupOptions: {
      input: "./js/app.tsx",
      output: {
        entryFileNames: "js/[name].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
      },
    },
  },
});
