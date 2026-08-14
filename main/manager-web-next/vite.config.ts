import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");

  return {
    base: env.VITE_PUBLIC_PATH || "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "src"),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "vendor",
                test: /node_modules[\\/]/,
              },
            ],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/xiaozhi": {
          target: env.VITE_DEV_API_TARGET || "http://127.0.0.1:18002",
          changeOrigin: true,
        },
        "/xiaozhi-ws": {
          target: env.VITE_DEV_WS_TARGET || "ws://127.0.0.1:18000",
          ws: true,
          rewrite: (requestPath) => requestPath.replace(/^\/xiaozhi-ws/, ""),
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      css: true,
      coverage: {
        reporter: ["text", "html"],
      },
    },
  };
});
