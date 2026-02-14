import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const seedProfiles = (db, role) => {
  db.prepare("INSERT INTO profiles (user_id, role) VALUES (?, ?)")
    .run("user-1", role);
};

const fillLogin = () => {
  const form = document.getElementById("admin-login-form");
  const emailInput = form.querySelector("input[name='email']");
  const passwordInput = form.querySelector("input[name='password']");
  emailInput.value = "admin@example.com";
  passwordInput.value = "secret";
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
};

describe("admin auth", () => {
  it("allows admin login", async () => {
    window.location.hash = "#admin";
    const client = await createSqliteSupabaseClient({
      users: [{ id: "user-1", email: "admin@example.com", password: "secret" }],
      seedFn: (db) => seedProfiles(db, "admin"),
    });

    await loadAppWithClient(client);
    fillLogin();
    await flushPromises();

    const panel = document.getElementById("admin-panel");
    expect(panel.classList.contains("hidden")).toBe(false);
  });

  it("rejects non-admin role", async () => {
    window.location.hash = "#admin";
    const client = await createSqliteSupabaseClient({
      users: [{ id: "user-1", email: "admin@example.com", password: "secret" }],
      seedFn: (db) => seedProfiles(db, "editor"),
    });

    await loadAppWithClient(client);
    fillLogin();
    await flushPromises();

    const errorEl = document.getElementById("admin-auth-error");
    expect(errorEl.classList.contains("hidden")).toBe(false);
    expect(errorEl.textContent).toContain("אין הרשאות");
  });
});
