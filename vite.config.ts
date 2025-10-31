// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

// Load Replit-only dev plugins *synchronously* to avoid async config issues
function getDevPlugins() {
  if (!isDev) return [];
  const plugins = [];
  try {
    const devBanner = require("@replit/vite-plugin-dev-banner").default;
    const cartographer = require("@replit/vite-plugin-cartographer").default;
    const runtimeErrorModal = require("@replit/vite-plugin-runtime-error-modal").default;
    plugins.push(devBanner(), cartographer(), runtimeErrorModal());
  } catch {
    // Fail gracefully if not installed or unavailable in production
  }
  return plugins;
}

export default defineConfig({
  root: "client",
  plugins: [react(), ...getDevPlugins()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    sourcemap: true,
    outDir: "../dist/public",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
});
