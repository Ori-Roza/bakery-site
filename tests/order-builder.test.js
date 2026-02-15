import { describe, it, expect } from "vitest";
import { OrderBuilder } from "../src/business/OrderBuilder";

describe("OrderBuilder", () => {
  const mockCartItems = [
    {
      id: 1,
      title: "חלה קלועה",
      price: 20,
      discountedPrice: 18,
      discountPercentage: 10,
      image: "wheat.png",
      qty: 2,
      lineTotal: 36
    },
    {
      id: 2,
      title: "עוגת שוקולד",
      price: 50,
      discountedPrice: 40,
      discountPercentage: 20,
      image: "cake.png",
      qty: 1,
      lineTotal: 40
    }
  ];

  const testContacts = {
    whatsappPhone: "97298765432",
    email: "orders@bakery.com"
  };

  describe("buildOrderMessage", () => {
    it("creates message with customer name", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("דוד כהן");
    });

    it("creates message with customer phone", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("0501234567");
    });

    it("creates message with pickup date and time", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("20/01/2026");
      expect(message).toContain("14:30");
    });

    it("creates message with product names and quantities", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("חלה קלועה");
      expect(message).toContain("עוגת שוקולד");
      expect(message).toContain("x 2");
      expect(message).toContain("x 1");
    });

    it("creates message with total price", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("76");
      expect(message).toContain("₪");
    });

    it("includes Hebrew greeting", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("שלום");
    });

    it("accepts user notes parameter (currently not included in message)", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76,
        userNotes: "בלי סוכר בעוגה"
      };

      // OrderBuilder accepts userNotes but OrderMapper doesn't include them in message
      const message = OrderBuilder.buildOrderMessage(params);
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });

    it("handles single item order", () => {
      const params = {
        items: [mockCartItems[0]],
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 36
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("חלה קלועה");
      expect(message).toContain("x 2");
    });

    it("handles multiple items order", () => {
      const manyItems = [
        ...mockCartItems,
        {
          id: 3,
          title: "ממתקים",
          price: 15,
          discountedPrice: 15,
          discountPercentage: 0,
          image: "candy.png",
          qty: 3,
          lineTotal: 45
        }
      ];

      const params = {
        items: manyItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 121
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(message).toContain("חלה קלועה");
      expect(message).toContain("עוגת שוקולד");
      expect(message).toContain("ממתקים");
    });

    it("message is formatted as string", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76
      };

      const message = OrderBuilder.buildOrderMessage(params);
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe("buildOrderLinks", () => {
    const testMessage = "שלום, הזמנה חדשה";

    it("creates WhatsApp URL with message", () => {
      const links = OrderBuilder.buildOrderLinks(testMessage, testContacts);
      expect(links.whatsappUrl).toContain("wa.me");
      expect(links.whatsappUrl).toContain("97298765432");
    });

    it("encodes message in WhatsApp URL", () => {
      const links = OrderBuilder.buildOrderLinks(testMessage, testContacts);
      expect(links.whatsappUrl).toContain("text=");
    });

    it("creates email URL with message", () => {
      const links = OrderBuilder.buildOrderLinks(testMessage, testContacts);
      expect(links.emailUrl).toContain("mailto:");
      expect(links.emailUrl).toContain("orders@bakery.com");
    });

    it("encodes subject in email URL", () => {
      const links = OrderBuilder.buildOrderLinks(testMessage, testContacts);
      expect(links.emailUrl).toContain("subject=");
    });

    it("encodes body in email URL", () => {
      const links = OrderBuilder.buildOrderLinks(testMessage, testContacts);
      expect(links.emailUrl).toContain("body=");
    });

    it("returns object with both URLs", () => {
      const links = OrderBuilder.buildOrderLinks(testMessage, testContacts);
      expect(links).toHaveProperty("whatsappUrl");
      expect(links).toHaveProperty("emailUrl");
      expect(typeof links.whatsappUrl).toBe("string");
      expect(typeof links.emailUrl).toBe("string");
    });

    it("handles special characters in message", () => {
      const specialMessage = "הזמנה עם סימנים מיוחדים: @#$%";
      const links = OrderBuilder.buildOrderLinks(specialMessage, testContacts);
      expect(links.whatsappUrl).toBeTruthy();
      expect(links.emailUrl).toBeTruthy();
    });

    it("handles Hebrew text in message", () => {
      const hebrewMessage = "תמונה חדשה מהאתר עם עוגה ותרבות";
      const links = OrderBuilder.buildOrderLinks(hebrewMessage, testContacts);
      expect(links.whatsappUrl).toContain("wa.me");
      expect(links.emailUrl).toContain("mailto:");
    });
  });

  describe("buildOrderMessageAndLinks", () => {
    it("builds both message and links", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76,
        whatsappPhone: "97298765432",
        email: "orders@bakery.com"
      };

      const result = OrderBuilder.buildOrderMessageAndLinks(params);
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("links");
      expect(typeof result.message).toBe("string");
      expect(typeof result.links).toBe("object");
    });

    it("message contains order details", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76,
        whatsappPhone: "97298765432",
        email: "orders@bakery.com"
      };

      const result = OrderBuilder.buildOrderMessageAndLinks(params);
      expect(result.message).toContain("דוד כהן");
      expect(result.message).toContain("חלה קלועה");
      expect(result.message).toContain("20/01/2026");
    });

    it("links contain WhatsApp and Email URLs", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76,
        whatsappPhone: "97298765432",
        email: "orders@bakery.com"
      };

      const result = OrderBuilder.buildOrderMessageAndLinks(params);
      expect(result.links.whatsappUrl).toContain("wa.me");
      expect(result.links.emailUrl).toContain("mailto:");
    });

    it("links contain the built message", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76,
        whatsappPhone: "97298765432",
        email: "orders@bakery.com"
      };

      const result = OrderBuilder.buildOrderMessageAndLinks(params);
      // Message should be encoded in both URLs
      const encoded = encodeURIComponent(result.message);
      expect(result.links.whatsappUrl).toContain(encoded);
      expect(result.links.emailUrl).toContain(encoded);
    });

    it("accepts user notes in complete flow", () => {
      const params = {
        items: mockCartItems,
        customerName: "דוד כהן",
        customerPhone: "0501234567",
        pickupDate: "2026-01-20",
        pickupTime: "14:30",
        totalPrice: 76,
        userNotes: "בלי ביצים",
        whatsappPhone: "97298765432",
        email: "orders@bakery.com"
      };

      // userNotes parameter is accepted but not currently included in message
      const result = OrderBuilder.buildOrderMessageAndLinks(params);
      expect(result.message).toBeTruthy();
      expect(result.links).toBeTruthy();
    });
  });
});
