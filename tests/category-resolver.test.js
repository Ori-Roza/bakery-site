import { describe, it, expect } from "vitest";
import { CategoryResolver } from "../src/business/CategoryResolver";

describe("CategoryResolver", () => {
  const mockCategories = [
    {
      id: 1,
      category_id: 1,
      category_name: "חלה",
      image_url: "assets/halah.png"
    },
    {
      id: 2,
      category_id: 2,
      category_name: "עוגות",
      image_url: "cakes.png" // No assets/ prefix
    },
    {
      id: 3,
      category_id: 3,
      category_name: "ממתקים",
      image_url: "assets/candies.png"
    }
  ];

  describe("getCategoryName", () => {
    it("returns category name by numeric ID", () => {
      const result = CategoryResolver.getCategoryName(mockCategories, 1);
      expect(result).toBe("חלה");
    });

    it("returns category name by string ID", () => {
      const result = CategoryResolver.getCategoryName(mockCategories, "2");
      expect(result).toBe("עוגות");
    });

    it("returns default name for non-existent ID", () => {
      const result = CategoryResolver.getCategoryName(mockCategories, 999);
      expect(result).toBe("ללא קטגוריה");
    });

    it("returns default name for null ID", () => {
      const result = CategoryResolver.getCategoryName(mockCategories, null);
      expect(result).toBe("ללא קטגוריה");
    });

    it("returns default name for empty categories", () => {
      const result = CategoryResolver.getCategoryName([], 1);
      expect(result).toBe("ללא קטגוריה");
    });

    it("finds category by category_id field", () => {
      const result = CategoryResolver.getCategoryName(mockCategories, 3);
      expect(result).toBe("ממתקים");
    });
  });

  describe("getCategoryThumbnail", () => {
    it("returns thumbnail URL for existing category", () => {
      const result = CategoryResolver.getCategoryThumbnail(mockCategories, 1);
      expect(result).toBe("halah.png");
    });

    it("strips 'assets/' prefix from thumbnail URL", () => {
      const result = CategoryResolver.getCategoryThumbnail(mockCategories, 1);
      expect(result).not.toContain("assets/");
      expect(result).toBe("halah.png");
    });

    it("returns URL without prefix unchanged", () => {
      const result = CategoryResolver.getCategoryThumbnail(mockCategories, 2);
      expect(result).toBe("cakes.png");
    });

    it("returns default thumbnail for non-existent ID", () => {
      const result = CategoryResolver.getCategoryThumbnail(mockCategories, 999);
      expect(result).toBe("all_categories.png");
    });

    it("returns default thumbnail for null ID", () => {
      const result = CategoryResolver.getCategoryThumbnail(mockCategories, null);
      expect(result).toBe("all_categories.png");
    });

    it("returns default thumbnail for empty categories", () => {
      const result = CategoryResolver.getCategoryThumbnail([], 1);
      expect(result).toBe("all_categories.png");
    });

    it("handles string category ID", () => {
      const result = CategoryResolver.getCategoryThumbnail(mockCategories, "3");
      expect(result).toBe("candies.png");
    });
  });

  describe("resolveCategoryId", () => {
    it("returns numeric ID if it exists", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, 1);
      expect(result).toBe(1);
    });

    it("returns null for non-existent numeric ID", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, 999);
      expect(result).toBeNull();
    });

    it("converts numeric string to number if valid", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "2");
      expect(result).toBe(2);
    });

    it("returns null for numeric string of non-existent ID", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "999");
      expect(result).toBeNull();
    });

    it("resolves by category name (case-insensitive)", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "חלה");
      expect(result).toBe(1);
    });

    it("resolves by category name uppercase", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "עוגות");
      expect(result).toBe(2);
    });

    it("returns null for non-existent category name", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "non-existent");
      expect(result).toBeNull();
    });

    it("returns null for invalid numeric string", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "abc");
      expect(result).toBeNull();
    });

    it("returns null for zero ID", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "0");
      expect(result).toBeNull();
    });

    it("returns null for negative numeric string", () => {
      const result = CategoryResolver.resolveCategoryId(mockCategories, "-5");
      expect(result).toBeNull();
    });
  });

  describe("getAllCategoryIds", () => {
    it("returns array of all category IDs", () => {
      const result = CategoryResolver.getAllCategoryIds(mockCategories);
      expect(result).toEqual([1, 2, 3]);
    });

    it("returns empty array for empty categories", () => {
      const result = CategoryResolver.getAllCategoryIds([]);
      expect(result).toEqual([]);
    });

    it("filters out undefined IDs", () => {
      const categoriesWithMissing = [
        { ...mockCategories[0] },
        { ...mockCategories[1], id: undefined },
        { ...mockCategories[2] }
      ];
      const result = CategoryResolver.getAllCategoryIds(categoriesWithMissing);
      expect(result).toEqual([1, 3]);
    });

    it("maintains ID order", () => {
      const result = CategoryResolver.getAllCategoryIds(mockCategories);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("categoryExists", () => {
    it("returns true for existing category", () => {
      const result = CategoryResolver.categoryExists(mockCategories, 1);
      expect(result).toBe(true);
    });

    it("returns false for non-existent category", () => {
      const result = CategoryResolver.categoryExists(mockCategories, 999);
      expect(result).toBe(false);
    });

    it("returns false for empty categories", () => {
      const result = CategoryResolver.categoryExists([], 1);
      expect(result).toBe(false);
    });

    it("checks all categories", () => {
      expect(CategoryResolver.categoryExists(mockCategories, 1)).toBe(true);
      expect(CategoryResolver.categoryExists(mockCategories, 2)).toBe(true);
      expect(CategoryResolver.categoryExists(mockCategories, 3)).toBe(true);
    });
  });

  describe("getCategoryById", () => {
    it("returns category object for existing ID", () => {
      const result = CategoryResolver.getCategoryById(mockCategories, 1);
      expect(result).toEqual(mockCategories[0]);
    });

    it("returns null for non-existent ID", () => {
      const result = CategoryResolver.getCategoryById(mockCategories, 999);
      expect(result).toBeNull();
    });

    it("returns null for empty categories", () => {
      const result = CategoryResolver.getCategoryById([], 1);
      expect(result).toBeNull();
    });

    it("returns exact category object reference", () => {
      const result = CategoryResolver.getCategoryById(mockCategories, 2);
      expect(result).toBe(mockCategories[1]);
    });

    it("returns category with all properties", () => {
      const result = CategoryResolver.getCategoryById(mockCategories, 3);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("category_id");
      expect(result).toHaveProperty("category_name");
      expect(result).toHaveProperty("image_url");
    });
  });
});
