import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createServer } from "./server/index.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin() {
  return {
    name: "express-plugin",
    apply: "serve", // Solo se aplica durante desarrollo (modo serve)
    configureServer(server) {
      const app = createServer();

      // Agrega la app de Express como middleware al servidor de desarrollo de Vite
      server.middlewares.use(app);
    },
  };
}