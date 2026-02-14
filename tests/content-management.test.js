import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const seedAdminContent = (db) => {
  db.prepare("INSERT INTO profiles (user_id, role) VALUES (?, ?)").run(
    "admin-1",
    "admin"
  );
  db.prepare(
    "INSERT INTO site_metadata (id, about_section, orders_accepting, header_title) VALUES (?, ?, ?, ?)"
  ).run(1, "ישן", 1, "כותרת ישנה");
};

const createAdminClient = async () =>
  createSqliteSupabaseClient({
    seed: false,
    seedFn: seedAdminContent,
    initialSession: { user: { id: "admin-1", email: "admin@example.com" } },
  });

describe("content management", () => {
  it("saves about and header title", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    document.getElementById("admin-about").value = "טקסט חדש";
    document.getElementById("admin-about-save").click();
    await flushPromises();

    document.getElementById("admin-header-title").value = "כותרת חדשה";
    document.getElementById("admin-header-title-save").click();
    await flushPromises();

    const row = client.__db
      .prepare("SELECT about_section, header_title FROM site_metadata WHERE id = 1")
      .get();
    expect(row.about_section).toBe("טקסט חדש");
    expect(row.header_title).toBe("כותרת חדשה");
  });

  it("updates orders accepting toggle", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    const toggle = document.getElementById("orders-accepting-toggle");
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));
    await flushPromises();

    const row = client.__db
      .prepare("SELECT orders_accepting FROM site_metadata WHERE id = 1")
      .get();
    expect(row.orders_accepting).toBe(0);

    const checkoutForm = document.getElementById("checkout-form");
    expect(checkoutForm.classList.contains("pointer-events-none")).toBe(true);
  });

  it("saves hero fields and chips", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    document.getElementById("admin-hero-title").value = "כותרת הירו";
    document.getElementById("admin-hero-description").value = "תיאור הירו";

    document.getElementById("admin-hero-add-chip").click();
    const chipInput = document.querySelector(".hero-chip-input");
    chipInput.value = "צ'יפ ראשון";
    chipInput.dispatchEvent(new Event("input", { bubbles: true }));

    document.getElementById("admin-hero-save").click();
    await flushPromises();

    const row = client.__db
      .prepare("SELECT hero_title, hero_description, hero_chips FROM site_metadata WHERE id = 1")
      .get();
    expect(row.hero_title).toBe("כותרת הירו");
    expect(row.hero_description).toBe("תיאור הירו");
    expect(JSON.parse(row.hero_chips)).toEqual(["צ'יפ ראשון"]);
  });
});
