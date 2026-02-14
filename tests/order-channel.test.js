import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient, flushPromises } from "./helpers/loadApp.js";

const setValidCheckout = (app) => {
  const next = app.__test__.getNextBusinessDateTime(new Date());
  if (next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  // Round up to next hour to ensure pickup time is after minimum
  // If we have minutes/seconds, add an hour
  if (next.getMinutes() > 0 || next.getSeconds() > 0) {
    next.setHours(next.getHours() + 1);
  }
  next.setMinutes(0, 0, 0);
  const yyyy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  const hh = String(next.getHours()).padStart(2, "0");

  document.getElementById("customer-name").value = "בדיקה";
  document.getElementById("customer-phone").value = "0503333333";
  document.getElementById("pickup-date").value = `${yyyy}-${mm}-${dd}`;
  document.getElementById("pickup-time").value = `${hh}:00`;
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
