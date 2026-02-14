import { vi } from "vitest";

export const loadAppWithClient = async (client) => {
  vi.resetModules();
  window.__DISABLE_AUTO_INIT__ = true;
  window.__SUPABASE_CLIENT__ = client;
  const app = await import("../../src/app.ts");
  await app.init();
  return app;
};

export const flushPromises = () => 
  new Promise((resolve) => {
    // Use microtask queue (Promise)
    Promise.resolve().then(() => {
      // Then use macrotask queue (setTimeout)
      setTimeout(() => {
        // Then flush animation frames
        let frameCount = 0;
        const frame = () => {
          frameCount++;
          if (frameCount < 2) {
            requestAnimationFrame(frame);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(frame);
      }, 0);
    });
  });
