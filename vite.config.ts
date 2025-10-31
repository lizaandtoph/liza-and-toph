// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isDev = process.env.NODE_ENV !== "production";

async function getDevPlugins() {
  if (!isDev) return [];
  try {
    const devBanner = (await import("@replit/vite-plugin-dev-banner")).default;
    const cartographer = (await import("@replit/vite-plugin-cartographer"))
      .default;
    const runtimeErrorModal = (
      await import("@replit/vite-plugin-runtime-error-modal")
    ).default;
    return [devBanner(), cartographer(), runtimeErrorModal()];
  } catch {
    return [];
  }
}

export default defineConfig(async () => ({
  plugins: [react(), ...(await getDevPlugins())],
  server: { host: true, port: 5173 },
  build: { sourcemap: true },
}));
