import { describe, it, expect, beforeEach } from "vitest";
import { CartManager } from "../src/business/CartManager";

describe("CartManager", () => {
  const mockProducts = [
    {
      id: 1,
      title: "חלה קלועה",
      price: 20,
      discountPercentage: 10,
      image: "wheat.png",
      category_id: 1,
      in_stock: true
    },
    {
      id: 2,
      title: "עוגת שוקולד",
      price: 50,
      discountPercentage: 20,
      image: "cake.png",
      category_id: 2,
      in_stock: true
    },
    {
      id: 3,
      title: "ממתקים",
      price: 15,
      discountPercentage: 0,
      image: "candy.png",
      category_id: 1,
      in_stock: true
    }
  ];

  describe("getCartItems", () => {
    it("returns empty array for empty cart", () => {
      const result = CartManager.getCartItems({}, mockProducts);
      expect(result).toEqual([]);
    });

    it("returns cart items with correct properties", () => {
      const cart = { "1": 2, "2": 1 };
      const result = CartManager.getCartItems(cart, mockProducts);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 1,
        title: "חלה קלועה",
        price: 20,
        qty: 2
      });
    });

    it("correctly calculates discounted price", () => {
      const cart = { "1": 1 };
      const result = CartManager.getCartItems(cart, mockProducts);

      // Price: 20, Discount: 10% -> 20 * 0.9 = 18
      expect(result[0].discountedPrice).toBe(18);
    });

    it("correctly calculates line total with discount", () => {
      const cart = { "1": 3 };
      const result = CartManager.getCartItems(cart, mockProducts);

      // Discounted price: 18, qty: 3 -> 18 * 3 = 54
      expect(result[0].lineTotal).toBe(54);
    });

    it("handles products with 0% discount", () => {
      const cart = { "3": 2 };
      const result = CartManager.getCartItems(cart, mockProducts);

      expect(result[0].discountedPrice).toBe(15); // No discount
      expect(result[0].lineTotal).toBe(30); // 15 * 2
    });

    it("handles products with decimal prices", () => {
      const productsWithDecimals = [
        { ...mockProducts[0], price: 18.5 },
      ];
      const cart = { "1": 2 };
      const result = CartManager.getCartItems(cart, productsWithDecimals);

      // 18.5 * 0.9 = 16.65, * 2 = 33.3
      expect(result[0].discountedPrice).toBeCloseTo(16.65);
      expect(result[0].lineTotal).toBeCloseTo(33.3);
    });

    it("ignores products that don't exist", () => {
      const cart = { "1": 1, "999": 5, "2": 1 };
      const result = CartManager.getCartItems(cart, mockProducts);

      expect(result).toHaveLength(2);
      expect(result.map(r => r.id)).toEqual([1, 2]);
    });

    it("includes product image field", () => {
      const cart = { "1": 1 };
      const result = CartManager.getCartItems(cart, mockProducts);

      expect(result[0].image).toBe("wheat.png");
    });
  });

  describe("getCartTotals", () => {
    it("returns correct totals for single item", () => {
      const cart = { "3": 1 };
      const result = CartManager.getCartTotals(cart, mockProducts);

      expect(result.totalQty).toBe(1);
      expect(result.totalPrice).toBe(15);
      expect(result.items).toHaveLength(1);
    });

    it("returns correct totals for multiple items", () => {
      const cart = { "1": 2, "2": 1, "3": 1 };
      const result = CartManager.getCartTotals(cart, mockProducts);

      // Item 1: 18 * 2 = 36
      // Item 2: 40 * 1 = 40
      // Item 3: 15 * 1 = 15
      // Total: 91
      expect(result.totalQty).toBe(4);
      expect(result.totalPrice).toBeCloseTo(91);
    });

    it("returns empty items array for empty cart", () => {
      const result = CartManager.getCartTotals({}, mockProducts);

      expect(result.totalQty).toBe(0);
      expect(result.totalPrice).toBe(0);
      expect(result.items).toEqual([]);
    });

    it("includes items in totals", () => {
      const cart = { "1": 1, "2": 1 };
      const result = CartManager.getCartTotals(cart, mockProducts);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].title).toBe("חלה קלועה");
      expect(result.items[1].title).toBe("עוגת שוקולד");
    });
  });

  describe("addToCart", () => {
    it("adds new product to empty cart", () => {
      const result = CartManager.addToCart({}, 1);
      expect(result).toEqual({ "1": 1 });
    });

    it("increments quantity for existing product", () => {
      const cart = { "1": 2 };
      const result = CartManager.addToCart(cart, 1);
      expect(result).toEqual({ "1": 3 });
    });

    it("adds new product to existing cart", () => {
      const cart = { "1": 1 };
      const result = CartManager.addToCart(cart, 2);
      expect(result).toEqual({ "1": 1, "2": 1 });
    });

    it("does not mutate original cart", () => {
      const originalCart = { "1": 1 };
      const result = CartManager.addToCart(originalCart, 2);
      expect(originalCart).toEqual({ "1": 1 });
      expect(result).toEqual({ "1": 1, "2": 1 });
    });
  });

  describe("updateQuantity", () => {
    it("increments quantity with positive delta", () => {
      const cart = { "1": 2 };
      const result = CartManager.updateQuantity(cart, 1, 3);
      expect(result).toEqual({ "1": 5 });
    });

    it("decrements quantity with negative delta", () => {
      const cart = { "1": 5 };
      const result = CartManager.updateQuantity(cart, 1, -2);
      expect(result).toEqual({ "1": 3 });
    });

    it("removes product when quantity becomes 0", () => {
      const cart = { "1": 1, "2": 2 };
      const result = CartManager.updateQuantity(cart, 1, -1);
      expect(result).toEqual({ "2": 2 });
    });

    it("removes product when quantity becomes negative", () => {
      const cart = { "1": 1, "2": 2 };
      const result = CartManager.updateQuantity(cart, 1, -5);
      expect(result).toEqual({ "2": 2 });
    });

    it("adds product that doesn't exist in cart", () => {
      const cart = { "1": 1 };
      const result = CartManager.updateQuantity(cart, 2, 3);
      expect(result).toEqual({ "1": 1, "2": 3 });
    });

    it("handles zero delta", () => {
      const cart = { "1": 5 };
      const result = CartManager.updateQuantity(cart, 1, 0);
      expect(result).toEqual({ "1": 5 });
    });

    it("does not mutate original cart", () => {
      const originalCart = { "1": 2 };
      CartManager.updateQuantity(originalCart, 1, 3);
      expect(originalCart).toEqual({ "1": 2 });
    });
  });

  describe("setQuantity", () => {
    it("sets quantity to exact value", () => {
      const cart = { "1": 5 };
      const result = CartManager.setQuantity(cart, 1, 3);
      expect(result).toEqual({ "1": 3 });
    });

    it("removes product when quantity set to 0", () => {
      const cart = { "1": 5, "2": 2 };
      const result = CartManager.setQuantity(cart, 1, 0);
      expect(result).toEqual({ "2": 2 });
    });

    it("removes product when quantity set to negative", () => {
      const cart = { "1": 5, "2": 2 };
      const result = CartManager.setQuantity(cart, 1, -3);
      expect(result).toEqual({ "2": 2 });
    });

    it("adds product that doesn't exist", () => {
      const cart = { "1": 1 };
      const result = CartManager.setQuantity(cart, 2, 5);
      expect(result).toEqual({ "1": 1, "2": 5 });
    });

    it("coerces string quantity to number", () => {
      const cart = { "1": 1 };
      const result = CartManager.setQuantity(cart, 1, "10");
      expect(result).toEqual({ "1": 10 });
    });

    it("handles NaN by setting quantity to 0", () => {
      const cart = { "1": 5, "2": 2 };
      const result = CartManager.setQuantity(cart, 1, "invalid");
      expect(result).toEqual({ "2": 2 });
    });

    it("does not mutate original cart", () => {
      const originalCart = { "1": 10 };
      CartManager.setQuantity(originalCart, 1, 5);
      expect(originalCart).toEqual({ "1": 10 });
    });
  });

  describe("clearCart", () => {
    it("returns empty object", () => {
      const result = CartManager.clearCart();
      expect(result).toEqual({});
    });

    it("always returns new empty object", () => {
      const result1 = CartManager.clearCart();
      const result2 = CartManager.clearCart();
      expect(result1).toEqual({});
      expect(result2).toEqual({});
      expect(result1).not.toBe(result2);
    });
  });
});
