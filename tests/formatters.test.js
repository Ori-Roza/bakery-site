import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDateForInput,
  formatTimeForInput
} from "../src/utils/formatters";

describe("formatCurrency", () => {
  it("formats integer as currency", () => {
    const result = formatCurrency(100);
    expect(result).toBe("₪100.00");
  });

  it("formats decimal number with proper precision", () => {
    const result = formatCurrency(42.5);
    expect(result).toBe("₪42.50");
  });

  it("formats string number as currency", () => {
    const result = formatCurrency("75");
    expect(result).toBe("₪75.00");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toBe("₪0.00");
  });

  it("formats small decimal precisely", () => {
    const result = formatCurrency(18.5);
    expect(result).toBe("₪18.50");
  });

  it("rounds to 2 decimal places", () => {
    const result = formatCurrency(19.999);
    expect(result).toBe("₪20.00");
  });

  it("includes shekel symbol", () => {
    const result = formatCurrency(100);
    expect(result).toContain("₪");
  });

  it("handles large numbers", () => {
    const result = formatCurrency(9999.99);
    expect(result).toBe("₪9999.99");
  });

  it("handles very small numbers", () => {
    const result = formatCurrency(0.01);
    expect(result).toBe("₪0.01");
  });

  it("handles negative numbers", () => {
    const result = formatCurrency(-50);
    expect(result).toBe("₪-50.00");
  });
});

describe("formatDateForInput", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date(2026, 0, 15); // January 15, 2026
    const result = formatDateForInput(date);
    expect(result).toBe("2026-01-15");
  });

  it("pads month with leading zero", () => {
    const date = new Date(2026, 0, 1); // January 1, 2026
    const result = formatDateForInput(date);
    expect(result).toBe("2026-01-01");
  });

  it("pads day with leading zero", () => {
    const date = new Date(2026, 11, 5); // December 5, 2026
    const result = formatDateForInput(date);
    expect(result).toBe("2026-12-05");
  });

  it("formats double-digit month correctly", () => {
    const date = new Date(2026, 9, 20); // October 20, 2026
    const result = formatDateForInput(date);
    expect(result).toBe("2026-10-20");
  });

  it("handles end of month", () => {
    const date = new Date(2026, 0, 31); // January 31, 2026
    const result = formatDateForInput(date);
    expect(result).toBe("2026-01-31");
  });

  it("handles day at end of year", () => {
    const date = new Date(2026, 11, 31); // December 31, 2026
    const result = formatDateForInput(date);
    expect(result).toBe("2026-12-31");
  });

  it("returns format compatible with HTML date input", () => {
    const date = new Date(2026, 5, 14); // June 14, 2026
    const result = formatDateForInput(date);
    // Should match pattern YYYY-MM-DD
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatTimeForInput", () => {
  it("formats time as HH:MM", () => {
    const date = new Date(2026, 0, 1, 14, 30);
    const result = formatTimeForInput(date);
    expect(result).toBe("14:30");
  });

  it("pads hour with leading zero", () => {
    const date = new Date(2026, 0, 1, 9, 45);
    const result = formatTimeForInput(date);
    expect(result).toBe("09:45");
  });

  it("pads minute with leading zero", () => {
    const date = new Date(2026, 0, 1, 16, 5);
    const result = formatTimeForInput(date);
    expect(result).toBe("16:05");
  });

  it("handles midnight", () => {
    const date = new Date(2026, 0, 1, 0, 0);
    const result = formatTimeForInput(date);
    expect(result).toBe("00:00");
  });

  it("handles noon", () => {
    const date = new Date(2026, 0, 1, 12, 0);
    const result = formatTimeForInput(date);
    expect(result).toBe("12:00");
  });

  it("handles 23:59", () => {
    const date = new Date(2026, 0, 1, 23, 59);
    const result = formatTimeForInput(date);
    expect(result).toBe("23:59");
  });

  it("returns format compatible with HTML time input", () => {
    const date = new Date(2026, 0, 1, 15, 30);
    const result = formatTimeForInput(date);
    // Should match pattern HH:MM
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("ignores seconds", () => {
    const date = new Date(2026, 0, 1, 10, 30, 45);
    const result = formatTimeForInput(date);
    expect(result).toBe("10:30");
  });
});
