import { describe, it, expect, vi } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";

const loadApp = async () => {
  vi.resetModules();
  window.__DISABLE_AUTO_INIT__ = true;
  window.__SUPABASE_CLIENT__ = await createSqliteSupabaseClient();
  return import("../src/app.ts");
};

describe("app utilities", () => {
  it("normalizes category ids by name", async () => {
    const app = await loadApp();
    app.__test__.state.categories = [
      { category_id: 5, category_name: "חלה" },
      { category_id: 6, category_name: "עוגות" },
    ];

    expect(app.__test__.normalizeCategoryId("חלה")).toBe(5);
    expect(app.__test__.normalizeCategoryId("6")).toBe(6);
    expect(app.__test__.normalizeCategoryId("missing")).toBe(null);
  });

  it("builds order links with defaults", async () => {
    const app = await loadApp();
    app.__test__.state.checkoutWhatsappPhone = "972555000000";
    app.__test__.state.checkoutEmail = "hello@example.com";

    const links = app.__test__.buildOrderLinks("test message");
    expect(links.whatsappUrl).toContain("https://wa.me/972555000000");
    expect(links.emailUrl).toContain("mailto:hello@example.com");
  });
});
