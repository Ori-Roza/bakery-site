import { vi } from "vitest";

export const loadAppWithClient = async (client) => {
  vi.resetModules();
  window.__DISABLE_AUTO_INIT__ = true;
  window.__SUPABASE_CLIENT__ = client;
  const app = await import("../../src/app.ts");
  await app.init();
  return app;
};

export const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
