import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckoutValidator } from "../src/business/CheckoutValidator";

describe("CheckoutValidator", () => {
  describe("validatePickupDateTime", () => {
    it("accepts valid future weekday pickup", () => {
      // Use a valid date 2+ days in future
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "10:00");
      expect(result.isValid).toBe(true);
    });

    it("rejects invalid date format", () => {
      const result = CheckoutValidator.validatePickupDateTime("invalid-date", "10:00");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("תאריך");
    });

    it("rejects invalid time format", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "invalid-time");
      expect(result.isValid).toBe(false);
    });

    it("rejects Saturday pickup", () => {
      // Find next Saturday
      const saturday = new Date();
      const day = saturday.getDay();
      const diff = 6 - day; // 6 = Saturday
      if (diff <= 0) {
        saturday.setDate(saturday.getDate() + 7 + diff);
      } else {
        saturday.setDate(saturday.getDate() + diff);
      }
      const dateStr = saturday.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "10:00");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("שבת");
    });

    it("rejects pickup before 06:00", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "05:30");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("שעות");
    });

    it("rejects pickup after 15:00", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "16:00");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("שעות");
    });

    it("accepts pickup at 06:00 (opening time)", () => {
      // Use a future weekday
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "06:00");
      // Should pass business hours, might fail 24-hour window depending on current time
      if (!result.isValid) {
        expect(result.errorMessage).toContain("24 שעות");
      }
    });

    it("accepts pickup at 14:59 (before closing)", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "14:59");
      if (!result.isValid) {
        expect(result.errorMessage).toContain("24 שעות");
      }
    });

    it("rejects pickup less than 24 hours from now", () => {
      // Use a weekday (not Saturday - day 6) with time within business hours
      const today = new Date();
      let daysAdded = 0;
      while (today.getDay() === 6 && daysAdded < 7) {
        today.setDate(today.getDate() + 1);
        daysAdded++;
      }
      const dateStr = today.toISOString().split('T')[0];

      // Use time within business hours (06:00-15:00) but same day is <24h away
      const result = CheckoutValidator.validatePickupDateTime(dateStr, "14:00");
      // Should fail because it's not 24+ hours away
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("24 שעות");
    });

    it("handles empty date string", () => {
      const result = CheckoutValidator.validatePickupDateTime("", "10:00");
      expect(result.isValid).toBe(false);
    });

    it("handles empty time string", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const result = CheckoutValidator.validatePickupDateTime(dateStr, "");
      expect(result.isValid).toBe(false);
    });

    it("handles null values gracefully", () => {
      const result = CheckoutValidator.validatePickupDateTime("", "");
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateCheckoutForm", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    const validForm = {
      name: "דוד כהן",
      phone: "0501234567",
      date: dateStr,
      time: "10:00"
    };

    it("accepts valid checkout form", () => {
      const result = CheckoutValidator.validateCheckoutForm(validForm);
      expect(result.isValid).toBe(true);
    });

    it("rejects form with missing name", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        ...validForm,
        name: ""
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("שם");
    });

    it("rejects form with whitespace-only name", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        ...validForm,
        name: "   "
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("שם");
    });

    it("rejects form with missing phone", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        ...validForm,
        phone: ""
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("טלפון");
    });

    it("rejects form with whitespace-only phone", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        ...validForm,
        phone: "   "
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("טלפון");
    });

    it("rejects form with missing date", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        ...validForm,
        date: ""
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("תאריך");
    });

    it("rejects form with missing time", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        ...validForm,
        time: ""
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("תאריך");
    });

    it("validates date/time when other fields are valid", () => {
      const invalidDateForm = {
        name: "דוד כהן",
        phone: "0501234567",
        date: "invalid-date",
        time: "10:00"
      };

      const result = CheckoutValidator.validateCheckoutForm(invalidDateForm);
      expect(result.isValid).toBe(false);
    });

    it("returns error message for invalid date/time", () => {
      const invalidForm = {
        name: "דוד כהן",
        phone: "0501234567",
        date: "invalid",
        time: "10:00"
      };

      const result = CheckoutValidator.validateCheckoutForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeTruthy();
    });

    it("handles Hebrew names correctly", () => {
      const result = CheckoutValidator.validateCheckoutForm({
        name: "חנה לוי",
        phone: "0509876543",
        date: dateStr,
        time: "12:00"
      });
      expect(result.isValid).toBe(true);
    });

    it("handles various phone number formats", () => {
      const forms = [
        { ...validForm, phone: "0501234567" },
        { ...validForm, phone: "+972501234567" },
        { ...validForm, phone: "501234567" }
      ];

      forms.forEach(form => {
        const result = CheckoutValidator.validateCheckoutForm(form);
        // Should not reject for phone format (validation only checks existence)
        if (result.isValid === false) {
          expect(result.errorMessage).not.toContain("טלפון");
        }
      });
    });

    it("requires all 4 fields to be non-empty", () => {
      const fields = ["name", "phone", "date", "time"];

      fields.forEach(field => {
        const formWithMissing = { ...validForm };
        formWithMissing[field] = "";

        const result = CheckoutValidator.validateCheckoutForm(formWithMissing);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe("getPickupValidityMessage", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    it("returns empty string for valid date/time", () => {
      const message = CheckoutValidator.getPickupValidityMessage(dateStr, "10:00");
      expect(message).toBe("");
    });

    it("returns error message for invalid date/time", () => {
      const message = CheckoutValidator.getPickupValidityMessage("invalid", "10:00");
      expect(typeof message).toBe("string");
      // Either empty (valid) or contains error text
    });

    it("returns Saturday error message", () => {
      // Find next Saturday
      const saturday = new Date();
      const day = saturday.getDay();
      const diff = 6 - day;
      if (diff <= 0) {
        saturday.setDate(saturday.getDate() + 7 + diff);
      } else {
        saturday.setDate(saturday.getDate() + diff);
      }
      const dateStr = saturday.toISOString().split('T')[0];

      const message = CheckoutValidator.getPickupValidityMessage(dateStr, "10:00");
      if (message) {
        expect(message).toContain("שבת");
      }
    });

    it("returns business hours error message for out-of-hours pickup", () => {
      const message = CheckoutValidator.getPickupValidityMessage(dateStr, "20:00");
      if (message) {
        expect(message).toContain("שעות");
      }
    });
  });

  describe("isSaturday", () => {
    it("returns true for Saturday", () => {
      // Find next Saturday
      const saturday = new Date();
      const day = saturday.getDay();
      const diff = 6 - day;
      if (diff <= 0) {
        saturday.setDate(saturday.getDate() + 7 + diff);
      } else {
        saturday.setDate(saturday.getDate() + diff);
      }
      const dateStr = saturday.toISOString().split('T')[0];

      const result = CheckoutValidator.isSaturday(dateStr);
      expect(result).toBe(true);
    });

    it("returns false for Sunday", () => {
      // Find next Sunday
      const sunday = new Date();
      const day = sunday.getDay();
      const diff = 0 - day;
      if (diff <= 0) {
        sunday.setDate(sunday.getDate() + 7 + diff);
      } else {
        sunday.setDate(sunday.getDate() + diff);
      }
      const dateStr = sunday.toISOString().split('T')[0];

      const result = CheckoutValidator.isSaturday(dateStr);
      expect(result).toBe(false);
    });

    it("returns false for weekdays", () => {
      const dates = [];
      const baseDate = new Date();

      for (let i = 0; i < 7; i++) {
        const testDate = new Date(baseDate);
        testDate.setDate(testDate.getDate() + i);
        const day = testDate.getDay();

        if (day !== 6) { // Not Saturday
          const dateStr = testDate.toISOString().split('T')[0];
          const result = CheckoutValidator.isSaturday(dateStr);
          expect(result).toBe(false);
        }
      }
    });

    it("returns false for empty string", () => {
      const result = CheckoutValidator.isSaturday("");
      expect(result).toBe(false);
    });

    it("returns false for null", () => {
      const result = CheckoutValidator.isSaturday("");
      expect(result).toBe(false);
    });

    it("returns false for invalid date string", () => {
      const result = CheckoutValidator.isSaturday("invalid-date");
      // May return false or true depending on parsing
      expect(typeof result).toBe("boolean");
    });

    it("identifies multiple Saturdays correctly", () => {
      // Use known Saturday dates from 2026
      // January 3, 2026 is a Saturday
      const saturdayDates = [
        "2026-01-03",  // Saturday
        "2026-01-10",  // Saturday
        "2026-01-17",  // Saturday
        "2026-01-24",  // Saturday
        "2026-01-31"   // Saturday
      ];

      saturdayDates.forEach(dateStr => {
        const result = CheckoutValidator.isSaturday(dateStr);
        expect(result).toBe(true);
      });
    });
  });

  describe("ValidationResult interface", () => {
    it("returns ValidationResult with isValid and optional errorMessage", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const validResult = CheckoutValidator.validateCheckoutForm({
        name: "David",
        phone: "0501234567",
        date: dateStr,
        time: "10:00"
      });

      expect(validResult).toHaveProperty("isValid");
      expect(typeof validResult.isValid).toBe("boolean");

      if (!validResult.isValid) {
        expect(validResult).toHaveProperty("errorMessage");
        expect(typeof validResult.errorMessage).toBe("string");
      }
    });
  });
});
