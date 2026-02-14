import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const seedAdminOrders = (db) => {
  db.prepare("INSERT INTO profiles (user_id, role) VALUES (?, ?)").run(
    "admin-1",
    "admin"
  );
  db.prepare(
    "INSERT INTO orders (id, created_at, items, total, customer, paid, notes, user_notes, order_number, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    "order-1",
    new Date().toISOString(),
    JSON.stringify([{ title: "חלה", qty: 1 }]),
    10,
    JSON.stringify({ name: "לקוח" }),
    0,
    "",
    "",
    1001,
    0
  );
  db.prepare(
    "INSERT INTO orders (id, created_at, items, total, customer, paid, notes, user_notes, order_number, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    "order-2",
    new Date().toISOString(),
    JSON.stringify([{ title: "עוגה", qty: 2 }]),
    20,
    JSON.stringify({ name: "לקוח 2" }),
    1,
    "",
    "",
    1002,
    0
  );
};

const createAdminClient = async () =>
  createSqliteSupabaseClient({
    seed: false,
    seedFn: seedAdminOrders,
    initialSession: { user: { id: "admin-1", email: "admin@example.com" } },
  });

describe("admin orders", () => {
  it("creates an order from admin modal", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    document.getElementById("admin-new-order").click();
    document.getElementById("order-name").value = "לקוח חדש";
    document.getElementById("order-total").value = "35";
    document.getElementById("order-save").click();
    await flushPromises();

    const count = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    expect(count.count).toBe(3);
  });

  it("updates paid status and notes", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    const paidCheckbox = document.querySelector(
      "input[data-order-field='paid'][data-order-id='order-1']"
    );
    paidCheckbox.checked = true;
    paidCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    await flushPromises();

    const updated = client.__db
      .prepare("SELECT paid FROM orders WHERE id = ?")
      .get("order-1");
    expect(updated.paid).toBe(1);

    const notesInput = document.querySelector(
      "input[data-order-field='notes'][data-order-id='order-1']"
    );
    notesInput.click();

    const popover = document.getElementById("notes-popover");
    expect(popover.classList.contains("hidden")).toBe(false);

    popover.querySelector("textarea").value = "הערת מנהל";
    document.body.click();
    await flushPromises();

    const notes = client.__db
      .prepare("SELECT notes FROM orders WHERE id = ?")
      .get("order-1");
    expect(notes.notes).toBe("הערת מנהל");
  });

  it("allows deleting unpaid orders", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    const deleteCheckbox = document.querySelector(
      "input[data-order-field='deleted'][data-order-id='order-1']"
    );
    deleteCheckbox.checked = true;
    deleteCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    await flushPromises();

    const updated = client.__db
      .prepare("SELECT deleted FROM orders WHERE id = ?")
      .get("order-1");
    expect(updated.deleted).toBe(1);
  });

  it("blocks deleting paid orders", async () => {
    window.location.hash = "#admin";
    const client = await createAdminClient();
    await loadAppWithClient(client);

    const deleteCheckbox = document.querySelector(
      "input[data-order-field='deleted'][data-order-id='order-2']"
    );
    deleteCheckbox.checked = true;
    deleteCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(window.alert).toHaveBeenCalled();
  });
});
