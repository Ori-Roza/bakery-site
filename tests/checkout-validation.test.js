import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const setCheckoutFields = ({ name, phone, date, time }) => {
  document.getElementById("customer-name").value = name;
  document.getElementById("customer-phone").value = phone;
  document.getElementById("pickup-date").value = date;
  document.getElementById("pickup-time").value = time;
};

const submitCheckout = async () => {
  const form = document.getElementById("checkout-form");
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await flushPromises();
};

const nextSaturday = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = (6 - day + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
};

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

describe("checkout validation", () => {
  it("rejects Saturday pickup", async () => {
    const client = await createSqliteSupabaseClient();
    await loadAppWithClient(client);

    document.querySelector("button[data-action='add']").click();

    const saturday = nextSaturday();
    setCheckoutFields({
      name: "בדיקה",
      phone: "0501111111",
      date: formatDate(saturday),
      time: "10:00",
    });

    // Count existing orders before submission
    const beforeRow = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    const countBefore = beforeRow.count;

    await submitCheckout();

    const afterRow = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    // No new orders should be created due to validation error
    expect(afterRow.count).toBe(countBefore);
    const errorEl = document.getElementById("checkout-error");
    expect(errorEl.textContent).toContain("שבת");
  });

  it("rejects pickups within 24 hours", async () => {
    const client = await createSqliteSupabaseClient();
    const app = await loadAppWithClient(client);

    document.querySelector("button[data-action='add']").click();

    const minDate = app.__test__.getNextBusinessDateTime(new Date());
    const invalidDate = new Date(minDate);
    invalidDate.setHours(10, 0, 0, 0);
    if (invalidDate >= minDate) {
      invalidDate.setDate(invalidDate.getDate() - 1);
    }
    if (invalidDate.getDay() === 6) {
      invalidDate.setDate(invalidDate.getDate() - 1);
    }

    setCheckoutFields({
      name: "בדיקה",
      phone: "0502222222",
      date: formatDate(invalidDate),
      time: "10:00",
    });

    // Count existing orders before submission
    const beforeRow = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    const countBefore = beforeRow.count;

    await submitCheckout();

    const afterRow = client.__db.prepare("SELECT COUNT(*) as count FROM orders").get();
    // No new orders should be created due to validation error
    expect(afterRow.count).toBe(countBefore);
    const errorEl = document.getElementById("checkout-error");
    expect(errorEl.textContent).toContain("24");
  });
});
