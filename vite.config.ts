import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VITE_BASE ?? "/", // GitHub Pages alt yol desteği
  plugins: [react()],
  build: {
    // Önce sandbox-yerel dizine yazılır, sonra build/ içine senkronlanır
    // (mount edilen dosya sisteminde unlink kısıtı — tools/syncBuild.mjs)
    outDir: process.env.VITE_OUT ?? "build",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // İçerik verisi ayrı, cache'lenebilir chunk'larda — uygulama kodu küçük kalır (14 #15)
        manualChunks(id: string) {
          if (id.includes("src/data/search-index")) return "search-index";
          if (id.includes("src/data/")) return "content";
          if (id.includes("node_modules/minisearch")) return "minisearch";
          if (id.includes("node_modules/shiki") || id.includes("node_modules/@shikijs")) return undefined;
          if (id.includes("node_modules")) return "vendor";
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
} as Parameters<typeof defineConfig>[0]);
