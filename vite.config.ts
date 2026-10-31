import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // The app calls /api/v1/* by default; forward it to the API.
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
