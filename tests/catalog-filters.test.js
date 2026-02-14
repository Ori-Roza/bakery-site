import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient } from "./helpers/loadApp.js";

const countProducts = () =>
  document.querySelectorAll(".product-card").length;

describe("catalog filters", () => {
  it("filters products by search text", async () => {
    const client = await createSqliteSupabaseClient();
    await loadAppWithClient(client);

    const searchInput = document.getElementById("product-search");
    searchInput.value = "שוקולד";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    expect(countProducts()).toBe(1);
  });

  it("filters products by category selection", async () => {
    const client = await createSqliteSupabaseClient();
    await loadAppWithClient(client);

    const categoryCards = Array.from(
      document.querySelectorAll(".category-card")
    );
    const cakesCard = categoryCards.find((card) =>
      card.textContent.includes("עוגות")
    );
    expect(cakesCard).toBeTruthy();

    cakesCard.click();
    expect(countProducts()).toBe(1);
  });
});
