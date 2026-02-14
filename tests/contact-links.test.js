import { describe, it, expect } from "vitest";
import { createSqliteSupabaseClient } from "./helpers/sqliteSupabaseMock.js";
import { loadAppWithClient } from "./helpers/loadApp.js";

const seedContact = (db) => {
  db.prepare(
    "INSERT INTO site_metadata (id, contact_address, contact_email, contact_whatsapp, bakery_telephone, store_phone) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    1,
    "רחוב המאפיה 12, ירושלים",
    "test@example.com",
    "+972501234567",
    "050-123-4567",
    "050-765-4321"
  );
};

const createClient = async () =>
  createSqliteSupabaseClient({ seed: false, seedFn: seedContact });

const setUserAgent = (value) => {
  Object.defineProperty(navigator, "userAgent", {
    value,
    configurable: true,
  });
};

describe("contact links", () => {
  it("uses Waze on mobile", async () => {
    setUserAgent("iPhone");
    const client = await createClient();
    await loadAppWithClient(client);

    const link = document.getElementById("contact-address-link");
    expect(link.href).toContain("https://waze.com/ul");
  });

  it("uses Google Maps on desktop", async () => {
    setUserAgent("Macintosh");
    const client = await createClient();
    await loadAppWithClient(client);

    const link = document.getElementById("contact-address-link");
    expect(link.href).toContain("https://www.google.com/maps/search/");
  });
});
