import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const setValidCheckout = (app) => {
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

  document.getElementById("customer-name").value = "בדיקה";
  document.getElementById("customer-phone").value = "0503333333";
  document.getElementById("pickup-date").value = `${yyyy}-${mm}-${dd}`;
  document.getElementById("pickup-time").value = "10:00";

  // Trigger change events to update validation
  document.getElementById("pickup-date").dispatchEvent(new Event("change", { bubbles: true }));
  document.getElementById("pickup-time").dispatchEvent(new Event("change", { bubbles: true }));
  // Also trigger blur to ensure validation is finalized
  document.getElementById("pickup-date").dispatchEvent(new Event("blur", { bubbles: true }));
  document.getElementById("pickup-time").dispatchEvent(new Event("blur", { bubbles: true }));
};

describe("order channel modal", () => {
  it("navigates to WhatsApp link", async () => {
    const client = await createSqliteSupabaseClient();
    const app = await loadAppWithClient(client);

    document.querySelector("button[data-action='add']").click();
    setValidCheckout(app);

    document
      .getElementById("checkout-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flushPromises();

    const modal = document.getElementById("order-channel-modal");
    expect(modal.classList.contains("hidden")).toBe(false);

    document.getElementById("order-channel-whatsapp").click();
    expect(window.location.href).toContain("https://wa.me/");
  });
});
