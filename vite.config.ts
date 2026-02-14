import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/bakery-site/" : "/",
  root: ".",
  publicDir: "src",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
  },
});
