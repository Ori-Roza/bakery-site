import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient } from "./helpers/loadApp.js";

describe("cart quantity", () => {
  it("increments and decrements item quantity", async () => {
    const client = await createSqliteSupabaseClient();
    await loadAppWithClient(client);

    const addButton = document.querySelector("button[data-action='add']");
    addButton.click();

    const incButton = document.querySelector("button[data-action='inc']");
    const floatingCount = document.getElementById("floating-count");

    incButton.click();
    expect(floatingCount.textContent).toBe("2");

    let decButton = document.querySelector("button[data-action='dec']");
    decButton.click();
    decButton = document.querySelector("button[data-action='dec']");
    decButton.click();

    const floatingCart = document.getElementById("floating-cart");
    expect(floatingCart.classList.contains("hidden")).toBe(true);
  });
});
