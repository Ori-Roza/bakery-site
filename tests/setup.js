import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, afterEach, vi } from "vitest";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");

beforeEach(() => {
  document.documentElement.innerHTML = html;
  window.__DISABLE_AUTO_INIT__ = true;
  window.__SUPABASE__ = {};
  window.__SUPABASE_CLIENT__ = null;
  window.lucide = { createIcons: () => {} };
  window.alert = vi.fn();
  window.requestAnimationFrame = (cb) => cb();

  if (!HTMLFormElement.prototype.reportValidity) {
    HTMLFormElement.prototype.reportValidity = () => true;
  }
  HTMLFormElement.prototype.checkValidity = () => true;

  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000/",
      hash: "",
      assign: (next) => {
        window.location.href = next;
      },
      replace: (next) => {
        window.location.href = next;
      },
    },
    writable: true,
    configurable: true,
  });

  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {};
  }
});

afterEach(() => {
  window.__SUPABASE_CLIENT__ = null;
  window.__DISABLE_AUTO_INIT__ = true;
  vi.restoreAllMocks();
});
