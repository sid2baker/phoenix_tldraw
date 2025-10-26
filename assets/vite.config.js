import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tidewave from "tidewave/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const isDev = command !== "build";

  if (isDev) {
    // Terminate the watcher when Phoenix quits
    process.stdin.on("close", () => {
      process.exit(0);
    });
    process.stdin.resume();
  }

  return {
    plugins: [react(), tidewave(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      cors: true,
      proxy: {
        // Proxy WebSocket and API requests to Phoenix
        "/sync": {
          target: "http://localhost:4000",
          changeOrigin: true,
          ws: true,
        },
        "/live_state": {
          target: "http://localhost:4000",
          changeOrigin: true,
          ws: true,
        },
        "/api": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "../priv/static",
      emptyOutDir: true,
      manifest: false,
      rollupOptions: {
        input: "./index.html",
        output: {
          entryFileNames: "js/[name]-[hash].js",
          chunkFileNames: "js/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
  };
});
