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

    // Set date to 3 days from now at 10:00 AM (definitely valid)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 0, 0, 0);
    // If it's Saturday, move to Sunday
    if (futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }
    const yyyy = futureDate.getFullYear();
    const mm = String(futureDate.getMonth() + 1).padStart(2, "0");
    const dd = String(futureDate.getDate()).padStart(2, "0");

    nameInput.value = "לקוח בדיקה";
    phoneInput.value = "0501234567";
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    timeInput.value = "10:00";

    // Trigger change events to update validation
    dateInput.dispatchEvent(new Event("change", { bubbles: true }));
    timeInput.dispatchEvent(new Event("change", { bubbles: true }));
    // Also trigger blur to ensure validation is finalized
    dateInput.dispatchEvent(new Event("blur", { bubbles: true }));
    timeInput.dispatchEvent(new Event("blur", { bubbles: true }));

    // Count orders before submission
    const countBeforeRow = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    const countBefore = countBeforeRow.count;

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await flushPromises();

    // Check if a new order was inserted
    const row = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    expect(row.count).toBe(countBefore + 1);

    const orderModal = document.getElementById("order-channel-modal");
    expect(orderModal.classList.contains("hidden")).toBe(false);
  });
});
