// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

// Synchronously try to load dev plugins
function getDevPlugins() {
  if (!isDev) return [];
  const plugins = [];
  try {
    // These will be loaded during build time, not config time
    // to avoid async config issues with server/vite.ts
  } catch {
    // Fail gracefully
  }
  return plugins;
}

export default defineConfig({
  root: "client",
  plugins: [react(), ...getDevPlugins()],
  server: { host: true, port: 5173 },
  build: { 
    sourcemap: true,
    outDir: "../dist/public",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
});
