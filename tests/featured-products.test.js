import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const seedFeatured = (db) => {
  db.prepare("INSERT INTO profiles (user_id, role) VALUES (?, ?)").run(
    "admin-1",
    "admin"
  );
  db.prepare(
    "INSERT INTO site_metadata (id, about_section, orders_accepting) VALUES (?, ?, ?)"
  ).run(1, "טקסט", 1);
  db.prepare(
    "INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)"
  ).run(1, "חלה", "assets/all_categories.png");
  db.prepare(
    "INSERT INTO products (id, title, price, discount_percentage, image, in_stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(11, "מוצר א", 10, 0, "assets/wheat.png", 1, 1);
  db.prepare(
    "INSERT INTO products (id, title, price, discount_percentage, image, in_stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(12, "מוצר ב", 12, 0, "assets/wheat.png", 1, 1);
  db.prepare(
    "INSERT INTO featured_products (site_metadata_id, product_id) VALUES (?, ?)"
  ).run(1, 11);
};

const createAdminClient = async () =>
  createSqliteSupabaseClient({
    seed: false,
    seedFn: seedFeatured,
    initialSession: { user: { id: "admin-1", email: "admin@example.com" } },
  });

describe("featured products", () => {
  it("saves selected featured products", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);
    await flushPromises();

    const checkboxes = document.querySelectorAll(".featured-product-checkbox");
    expect(checkboxes.length).toBeGreaterThan(1);
    checkboxes[0].checked = true;
    checkboxes[1].checked = true;

    document.getElementById("admin-featured-save").click();
    await flushPromises();

    const count = client.__db
      .prepare("SELECT COUNT(*) as count FROM featured_products")
      .get();
    expect(count.count).toBe(2);

    const rows = client.__db
      .prepare("SELECT product_id FROM featured_products ORDER BY product_id")
      .all();
    expect(rows.map((row) => row.product_id)).toEqual([11, 12]);
  });
});
