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
};

const createAdminClient = async () =>
  createSqliteSupabaseClient({
    seed: false,
    seedFn: seedAdmin,
    initialSession: { user: { id: "admin-1", email: "admin@example.com" } },
  });

const setFileInput = (input, fileName = "image.png") => {
  const file = new File(["data"], fileName, { type: "image/png" });
  Object.defineProperty(input, "files", {
    value: [file],
    configurable: true,
  });
};

describe("admin products", () => {
  it("creates, edits, and deletes a product", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    document.getElementById("open-create-modal").click();
    document.getElementById("create-title").value = "מוצר חדש";
    document.getElementById("create-price").value = "12.5";
    setFileInput(document.getElementById("create-image"));
    document.getElementById("create-save").click();
    await flushPromises();

    let count = client.__db.prepare("SELECT COUNT(*) as count FROM products").get();
    expect(count.count).toBe(1);

    const productRow = document.querySelector("#admin-products tr");
    productRow.click();
    const priceInput = document.getElementById("modal-price");
    priceInput.value = "20";
    document.getElementById("modal-save").click();
    await flushPromises();

    const updated = client.__db
      .prepare("SELECT price FROM products WHERE title = ?")
      .get("מוצר חדש");
    expect(Number(updated.price)).toBe(20);

    const deleteRow = document.querySelector("#admin-products tr");
    deleteRow.click();
    document.getElementById("modal-delete").click();
    document.getElementById("delete-confirm-yes").click();
    await flushPromises();

    count = client.__db.prepare("SELECT COUNT(*) as count FROM products").get();
    expect(count.count).toBe(0);
  });
});
