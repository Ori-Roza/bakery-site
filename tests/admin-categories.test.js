import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const seedAdmin = (db) => {
  db.prepare("INSERT INTO profiles (user_id, role) VALUES (?, ?)").run(
    "admin-1",
    "admin"
  );
  db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
    1,
    "חלה",
    "assets/all_categories.png"
  );
  db.prepare(
    "INSERT INTO products (id, title, price, discount_percentage, image, in_stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(1, "מוצר פעיל", 10, 0, "assets/wheat.png", 1, 1);
};

const createAdminClient = async () =>
  createSqliteSupabaseClient({
    seed: false,
    seedFn: seedAdmin,
    initialSession: { user: { id: "admin-1", email: "admin@example.com" } },
  });

const createAdminClientNoProducts = async () =>
  createSqliteSupabaseClient({
    seed: false,
    seedFn: (db) => {
      db.prepare("INSERT INTO profiles (user_id, role) VALUES (?, ?)").run(
        "admin-1",
        "admin"
      );
      db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
        1,
        "חלה",
        "assets/all_categories.png"
      );
    },
    initialSession: { user: { id: "admin-1", email: "admin@example.com" } },
  });

describe("admin categories", () => {
  it("creates and edits category", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    document.getElementById("admin-create-category").click();
    document.getElementById("category-name").value = "עוגות";
    document.getElementById("category-save").click();
    await flushPromises();

    let count = client.__db.prepare("SELECT COUNT(*) as count FROM categories").get();
    expect(count.count).toBe(2);

    const row = Array.from(document.querySelectorAll("#admin-categories tr"))
      .find((tr) => tr.textContent.includes("עוגות"));
    row.click();

    document.getElementById("category-edit-name").value = "עוגות מעודכן";
    document.getElementById("category-edit-save").click();
    await flushPromises();

    const updated = client.__db
      .prepare("SELECT name FROM categories WHERE name = ?")
      .get("עוגות מעודכן");
    expect(updated).toBeTruthy();
  });

  it("blocks deleting categories with active products", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    const row = document.querySelector("#admin-categories tr");
    const deleteButton = row.querySelector("button[data-action='delete-category']");
    deleteButton.click();

    expect(window.alert).toHaveBeenCalled();
    const count = client.__db.prepare("SELECT COUNT(*) as count FROM categories").get();
    expect(count.count).toBe(1);
  });

  it("deletes categories without active products", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClientNoProducts();
    await loadAppWithClient(client);

    const row = document.querySelector("#admin-categories tr");
    const deleteButton = row.querySelector("button[data-action='delete-category']");
    deleteButton.click();
    document.getElementById("delete-confirm-yes").click();
    await flushPromises();

    const count = client.__db.prepare("SELECT COUNT(*) as count FROM categories").get();
    expect(count.count).toBe(0);
  });
});
