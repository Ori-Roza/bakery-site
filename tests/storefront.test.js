import { describe, it, expect, vi } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const pickNextBusinessSlot = (app) => {
  const date = app.__test__.getNextBusinessDateTime(new Date());
  const day = date.getDay();
  if (day === 6) {
    date.setDate(date.getDate() + 1);
    date.setHours(6, 0, 0, 0);
  }
  // Round up to next hour to ensure pickup time is after minimum  
  // If we have minutes/seconds, add an hour
  if (date.getMinutes() > 0 || date.getSeconds() > 0) {
    date.setHours(date.getHours() + 1);
  }
  date.setMinutes(0, 0, 0);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:00` };
};

describe("storefront", () => {
  it("renders products and adds to cart", async () => {
    const client = await createSqliteSupabaseClient();
    await loadAppWithClient(client);

    const productButtons = document.querySelectorAll("button[data-action='add']");
    expect(productButtons.length).toBeGreaterThan(0);

    productButtons[0].click();
    const floatingCart = document.getElementById("floating-cart");
    const floatingCount = document.getElementById("floating-count");

    expect(floatingCart.classList.contains("hidden")).toBe(false);
    expect(floatingCount.textContent).toBe("1");
  });

  it("submits checkout and inserts order", async () => {
    const client = await createSqliteSupabaseClient();
    const app = await loadAppWithClient(client);

    const productButton = document.querySelector("button[data-action='add']");
    productButton.click();

    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    const dateInput = document.getElementById("pickup-date");
    const timeInput = document.getElementById("pickup-time");
    const form = document.getElementById("checkout-form");

    const nextSlot = pickNextBusinessSlot(app);

    nameInput.value = "לקוח בדיקה";
    phoneInput.value = "0501234567";
    dateInput.value = nextSlot.date;
    timeInput.value = nextSlot.time;

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await flushPromises();

    const orderModal = document.getElementById("order-channel-modal");
    expect(orderModal.classList.contains("hidden")).toBe(false);

    const row = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    expect(row.count).toBe(1);
  });
});
