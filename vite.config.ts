import { defineConfig } from "vite";
import { resolve } from "path";

const isMockDb = process.env.MOCK_DB === "true";

/**
 * Vite plugin to inject mock SQLite database for local development.
 * When MOCK_DB=true, replaces the app.ts script tag with a wrapper
 * that initializes the mock DB first, then loads the app.
 */
function mockDbPlugin() {
  return {
    name: "mock-db-inject",
    transformIndexHtml(html: string) {
      if (!isMockDb) return html;

      // Replace the app.ts script with a mock-loading wrapper
      return html.replace(
        '<script type="module" src="src/app.ts"></script>',
        `<script type="module">
          import { createBrowserMockClient } from '/src/dev/mockClient.js';

          // Initialize mock DB before loading the app
          window.__SUPABASE_CLIENT__ = createBrowserMockClient();
          window.__MOCK_MODE__ = true;

          // Now load the app (mock client is ready)
          await import('/src/app.ts');
        </script>`
      );
    },
  };
}

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
  plugins: [mockDbPlugin()],
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
  },
});
