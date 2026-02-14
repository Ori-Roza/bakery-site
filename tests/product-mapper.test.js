import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProductMapper } from "../src/models/ProductMapper";

describe("ProductMapper", () => {
  const mockDbRow = {
    id: 1,
    title: "חלה קלועה",
    price: "20.00",
    discount_percentage: "10",
    category_id: 1,
    image: "wheat.png",
    in_stock: true,
    categories: { name: "חלה" }
  };

  const mockCategories = [
    { id: 1, category_id: 1, category_name: "חלה", image_url: "halah.png" },
    { id: 2, category_id: 2, category_name: "עוגות", image_url: "cakes.png" }
  ];

  const mockProduct = {
    id: 1,
    title: "חלה קלועה",
    price: 20,
    discountPercentage: 10,
    categoryId: 1,
    categoryName: "חלה",
    image: "wheat.png",
    inStock: true
  };

  describe("mapDbToProduct", () => {
    it("maps database row to Product model", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);

      expect(result).toEqual({
        id: 1,
        title: "חלה קלועה",
        price: 20,
        discountPercentage: 10,
        categoryId: 1,
        categoryName: "חלה",
        image: "wheat.png",
        inStock: true
      });
    });

    it("converts price string to number", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(typeof result.price).toBe("number");
      expect(result.price).toBe(20);
    });

    it("converts discount_percentage string to number", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(typeof result.discountPercentage).toBe("number");
      expect(result.discountPercentage).toBe(10);
    });

    it("defaults discount_percentage to 0 when missing", () => {
      const rowWithoutDiscount = { ...mockDbRow, discount_percentage: undefined };
      const result = ProductMapper.mapDbToProduct(rowWithoutDiscount);
      expect(result.discountPercentage).toBe(0);
    });

    it("extracts category name from nested categories object", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(result.categoryName).toBe("חלה");
    });

    it("handles missing categories object", () => {
      const rowWithoutCategories = { ...mockDbRow, categories: undefined };
      const result = ProductMapper.mapDbToProduct(rowWithoutCategories);
      expect(result.categoryName).toBe("");
    });

    it("handles null category_id", () => {
      const rowWithoutCategory = { ...mockDbRow, category_id: null };
      const result = ProductMapper.mapDbToProduct(rowWithoutCategory);
      expect(result.categoryId).toBeNull();
    });

    it("preserves image URL", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(result.image).toBe("wheat.png");
    });

    it("handles in_stock boolean", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(result.inStock).toBe(true);
    });

    it("handles in_stock false", () => {
      const outOfStockRow = { ...mockDbRow, in_stock: false };
      const result = ProductMapper.mapDbToProduct(outOfStockRow);
      expect(result.inStock).toBe(false);
    });

    it("handles decimal prices correctly", () => {
      const decimalRow = { ...mockDbRow, price: "18.50", discount_percentage: "15" };
      const result = ProductMapper.mapDbToProduct(decimalRow);
      expect(result.price).toBe(18.5);
    });

    it("preserves all required fields", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("price");
      expect(result).toHaveProperty("discountPercentage");
      expect(result).toHaveProperty("categoryId");
      expect(result).toHaveProperty("categoryName");
      expect(result).toHaveProperty("image");
      expect(result).toHaveProperty("inStock");
    });
  });

  describe("mapProductToDb", () => {
    const mockNormalizeCategoryId = (val) => (typeof val === 'number' ? val : null);

    it("maps Product to database payload", () => {
      const result = ProductMapper.mapProductToDb(mockProduct, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result).toEqual({
        title: "חלה קלועה",
        price: 20,
        discount_percentage: 10,
        category_id: 1,
        image: "wheat.png",
        in_stock: true
      });
    });

    it("excludes id when includeId is false", () => {
      const result = ProductMapper.mapProductToDb(mockProduct, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result).not.toHaveProperty("id");
    });

    it("includes id when includeId is true", () => {
      const result = ProductMapper.mapProductToDb(mockProduct, {
        includeId: true,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toBe(1);
    });

    it("normalizes category_id using provided function", () => {
      const result = ProductMapper.mapProductToDb(mockProduct, {
        includeId: false,
        normalizeCategoryId: (val) => (typeof val === 'number' ? val * 10 : null)
      });

      expect(result.category_id).toBe(10); // 1 * 10
    });

    it("defaults discountPercentage to 0 when missing", () => {
      const productWithoutDiscount = { ...mockProduct };
      delete productWithoutDiscount.discountPercentage;

      const result = ProductMapper.mapProductToDb(productWithoutDiscount, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result.discount_percentage).toBe(0);
    });

    it("handles null categoryId", () => {
      const productWithoutCategory = { ...mockProduct, categoryId: null };

      const result = ProductMapper.mapProductToDb(productWithoutCategory, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result.category_id).toBeNull();
    });

    it("converts snake_case to camelCase for database fields", () => {
      const result = ProductMapper.mapProductToDb(mockProduct, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result).toHaveProperty("discount_percentage");
      expect(result).toHaveProperty("category_id");
      expect(result).toHaveProperty("in_stock");
    });

    it("handles partial product object", () => {
      const partialProduct = { title: "New Product", price: 50 };

      const result = ProductMapper.mapProductToDb(partialProduct, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result.title).toBe("New Product");
      expect(result.price).toBe(50);
      expect(result.discount_percentage).toBe(0);
    });

    it("uses default normalizeCategoryId when not provided", () => {
      const result = ProductMapper.mapProductToDb(mockProduct, {
        includeId: false,
        normalizeCategoryId: (val) => (typeof val === 'number' ? val : null)
      });

      expect(result.category_id).toBe(1);
    });

    it("preserves decimal prices", () => {
      const productWithDecimalPrice = { ...mockProduct, price: 18.5 };

      const result = ProductMapper.mapProductToDb(productWithDecimalPrice, {
        includeId: false,
        normalizeCategoryId: mockNormalizeCategoryId
      });

      expect(result.price).toBe(18.5);
    });
  });

  describe("getCategoryLabel", () => {
    it("returns categoryName when available", () => {
      const product = {
        ...mockProduct,
        categoryName: "חלה"
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("חלה");
    });

    it("finds category name by categoryId when categoryName is missing", () => {
      const product = {
        id: 2,
        title: "עוגה",
        price: 50,
        discountPercentage: 20,
        categoryId: 2,
        categoryName: "",
        image: "cake.png",
        inStock: true
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("עוגות");
    });

    it("returns empty string when category not found", () => {
      const product = {
        ...mockProduct,
        categoryId: 999,
        categoryName: ""
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("");
    });

    it("returns empty string when both categoryName and categoryId missing", () => {
      const product = {
        id: 3,
        title: "Unknown",
        price: 10,
        discountPercentage: 0,
        categoryId: null,
        categoryName: "",
        image: "unknown.png",
        inStock: true
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("");
    });

    it("handles string categoryId and number category_id comparison", () => {
      const product = {
        ...mockProduct,
        categoryId: 2,
        categoryName: ""
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("עוגות");
    });

    it("prioritizes categoryName over categoryId lookup", () => {
      const product = {
        ...mockProduct,
        categoryId: 2,
        categoryName: "חלה"
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("חלה"); // Returns categoryName, not the lookup result
    });
  });

  describe("convenience functions", () => {
    it("mapDbToProduct convenience function works", () => {
      const result = ProductMapper.mapDbToProduct(mockDbRow);
      expect(result.title).toBe("חלה קלועה");
    });

    it("mapProductToDb convenience function works", () => {
      const product = {
        title: "עוגה",
        price: 50,
        discountPercentage: 20
      };

      const result = ProductMapper.mapProductToDb(product, {
        normalizeCategoryId: (val) => val
      });

      expect(result.title).toBe("עוגה");
      expect(result.price).toBe(50);
    });

    it("getCategoryLabel convenience function works", () => {
      const product = {
        ...mockProduct,
        categoryName: "חלה"
      };

      const result = ProductMapper.getCategoryLabel(product, mockCategories);
      expect(result).toBe("חלה");
    });
  });
});
