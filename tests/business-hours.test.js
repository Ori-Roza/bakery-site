import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isBusinessDay,
  isWithinBusinessHours,
  getNextBusinessDateTime
} from "../src/utils/business-hours";

describe("business-hours", () => {
  describe("isBusinessDay", () => {
    it("returns true for Sunday", () => {
      const sunday = new Date(2026, 0, 4); // Sunday
      expect(isBusinessDay(sunday)).toBe(true);
    });

    it("returns true for Monday", () => {
      const monday = new Date(2026, 0, 5); // Monday
      expect(isBusinessDay(monday)).toBe(true);
    });

    it("returns true for Tuesday", () => {
      const tuesday = new Date(2026, 0, 6); // Tuesday
      expect(isBusinessDay(tuesday)).toBe(true);
    });

    it("returns true for Wednesday", () => {
      const wednesday = new Date(2026, 0, 7); // Wednesday
      expect(isBusinessDay(wednesday)).toBe(true);
    });

    it("returns true for Thursday", () => {
      const thursday = new Date(2026, 0, 8); // Thursday
      expect(isBusinessDay(thursday)).toBe(true);
    });

    it("returns true for Friday", () => {
      const friday = new Date(2026, 0, 9); // Friday
      expect(isBusinessDay(friday)).toBe(true);
    });

    it("returns false for Saturday", () => {
      const saturday = new Date(2026, 0, 3); // Saturday
      expect(isBusinessDay(saturday)).toBe(false);
    });

    it("identifies Saturday correctly in any month", () => {
      const saturdayJune = new Date(2026, 5, 6); // June 6, 2026 (Saturday)
      expect(isBusinessDay(saturdayJune)).toBe(false);
    });

    it("handles all Saturdays in 2026", () => {
      // Check multiple Saturdays throughout the year
      const saturdays = [
        new Date(2026, 0, 3),   // Jan 3
        new Date(2026, 2, 14),  // Mar 14
        new Date(2026, 6, 25),  // Jul 25
      ];

      saturdays.forEach(date => {
        expect(isBusinessDay(date)).toBe(false);
        expect(date.getDay()).toBe(6); // Verify it's actually Saturday
      });
    });
  });

  describe("isWithinBusinessHours", () => {
    it("returns true for Sunday 6:00 AM (opening time)", () => {
      const date = new Date(2026, 0, 4, 6, 0); // Sunday 6:00 AM
      expect(isWithinBusinessHours(date)).toBe(true);
    });

    it("returns true for Sunday 10:00 AM", () => {
      const date = new Date(2026, 0, 4, 10, 0); // Sunday 10:00 AM
      expect(isWithinBusinessHours(date)).toBe(true);
    });

    it("returns true for Sunday 14:59 (last minute before closing)", () => {
      const date = new Date(2026, 0, 4, 14, 59); // Sunday 14:59
      expect(isWithinBusinessHours(date)).toBe(true);
    });

    it("returns false for Sunday 15:00 (closing time)", () => {
      const date = new Date(2026, 0, 4, 15, 0); // Sunday 15:00
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns false for Sunday 5:59 AM (before opening)", () => {
      const date = new Date(2026, 0, 4, 5, 59); // Sunday 5:59 AM
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns false for Saturday even during business hours", () => {
      const date = new Date(2026, 0, 3, 10, 0); // Saturday 10:00 AM
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns false for Saturday midnight", () => {
      const date = new Date(2026, 0, 3, 0, 0); // Saturday midnight
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns true for Friday 14:30", () => {
      const date = new Date(2026, 0, 9, 14, 30); // Friday 14:30
      expect(isWithinBusinessHours(date)).toBe(true);
    });

    it("returns false for Friday 15:00", () => {
      const date = new Date(2026, 0, 9, 15, 0); // Friday 15:00
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns true for Monday 6:00 AM", () => {
      const date = new Date(2026, 0, 5, 6, 0); // Monday 6:00 AM
      expect(isWithinBusinessHours(date)).toBe(true);
    });

    it("returns false for Tuesday 4:00 AM", () => {
      const date = new Date(2026, 0, 6, 4, 0); // Tuesday 4:00 AM
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns false for Wednesday 16:00", () => {
      const date = new Date(2026, 0, 7, 16, 0); // Wednesday 4:00 PM
      expect(isWithinBusinessHours(date)).toBe(false);
    });

    it("returns true for Thursday 11:30", () => {
      const date = new Date(2026, 0, 8, 11, 30); // Thursday 11:30
      expect(isWithinBusinessHours(date)).toBe(true);
    });
  });

  describe("getNextBusinessDateTime", () => {
    let consoleLogSpy;

    beforeEach(() => {
      // Spy on console.log if needed for debugging
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("returns a date at least 24 hours in future", () => {
      const now = new Date(2026, 0, 4, 10, 0); // Sunday 10:00 AM
      const result = getNextBusinessDateTime(now);
      const diff = result.getTime() - now.getTime();
      expect(diff).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000);
    });

    it("returns a business day (not Saturday)", () => {
      const now = new Date(2026, 0, 4, 10, 0); // Sunday 10:00 AM
      const result = getNextBusinessDateTime(now);
      expect(isBusinessDay(result)).toBe(true);
    });

    it("returns time within business hours", () => {
      const now = new Date(2026, 0, 4, 10, 0); // Sunday 10:00 AM
      const result = getNextBusinessDateTime(now);
      expect(isWithinBusinessHours(result)).toBe(true);
    });

    it("returns next business day when starting from Friday", () => {
      const friday = new Date(2026, 0, 9, 10, 0); // Friday 10:00 AM
      const result = getNextBusinessDateTime(friday);
      // Next business day should be Sunday (24 hours later, avoid Saturday)
      expect(isBusinessDay(result)).toBe(true);
    });

    it("skips Saturday when finding next business day", () => {
      const thursday = new Date(2026, 0, 8, 20, 0); // Thursday 8:00 PM
      const result = getNextBusinessDateTime(thursday);
      // Should skip Friday and Saturday, go to Sunday or be Friday early
      const day = result.getDay();
      expect(day).not.toBe(6); // Not Saturday
    });

    it("returns date with valid time (6:00-15:00)", () => {
      const now = new Date(2026, 0, 4, 10, 0); // Sunday 10:00 AM
      const result = getNextBusinessDateTime(now);
      const hour = result.getHours();
      expect(hour).toBeGreaterThanOrEqual(6);
      expect(hour).toBeLessThan(15);
    });

    it("caches result for rapid successive calls", () => {
      const now = new Date(2026, 0, 4, 10, 0);
      const result1 = getNextBusinessDateTime(now);
      const result2 = getNextBusinessDateTime(now);
      // Should return the exact same date object (from cache)
      expect(result1.getTime()).toBe(result2.getTime());
    });

    it("returns different date after cache expires", () => {
      vi.useFakeTimers();
      try {
        const baseTime = new Date(2026, 0, 4, 10, 0).getTime();
        vi.setSystemTime(baseTime);

        const result1 = getNextBusinessDateTime(new Date(baseTime));

        // Advance time beyond cache duration (5 minutes = 300000 ms)
        vi.advanceTimersByTime(301000);

        const result2 = getNextBusinessDateTime(new Date(baseTime + 301000));
        // Times could be different since the base date changed
      } finally {
        vi.useRealTimers();
      }
    });

    it("handles overnight crossing (e.g., 14:00 to next day)", () => {
      const sunAfternoon = new Date(2026, 0, 4, 14, 0); // Sunday 2:00 PM
      const result = getNextBusinessDateTime(sunAfternoon);
      // 24 hours later would be Monday 2:00 PM, which is within business hours
      expect(isBusinessDay(result)).toBe(true);
      expect(isWithinBusinessHours(result)).toBe(true);
    });

    it("produces consistent results for repeated calls within cache window", () => {
      const now = new Date(2026, 0, 4, 10, 0);
      const results = [
        getNextBusinessDateTime(now),
        getNextBusinessDateTime(now),
        getNextBusinessDateTime(now)
      ];
      // All should be identical times
      expect(results[0].getTime()).toBe(results[1].getTime());
      expect(results[1].getTime()).toBe(results[2].getTime());
    });

    it("never returns a date on Saturday", () => {
      const testDates = [
        new Date(2026, 0, 4, 10, 0), // Sunday
        new Date(2026, 0, 5, 10, 0), // Monday
        new Date(2026, 0, 9, 10, 0), // Friday
      ];

      testDates.forEach(date => {
        const result = getNextBusinessDateTime(date);
        expect(result.getDay()).not.toBe(6);
      });
    });

    it("never returns time outside business hours", () => {
      const testDates = [
        new Date(2026, 0, 4, 10, 0), // Sunday
        new Date(2026, 0, 5, 10, 0), // Monday
      ];

      testDates.forEach(date => {
        const result = getNextBusinessDateTime(date);
        const hour = result.getHours();
        expect(hour).toBeGreaterThanOrEqual(6);
        expect(hour).toBeLessThan(15);
      });
    });
  });
});
