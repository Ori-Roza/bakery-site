import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProductService } from "../src/services/ProductService";
import { ProductMapper } from "../src/models/ProductMapper";

describe("ProductService", () => {
  let mockClient;
  let productService;

  const mockDbProduct = {
    id: 1,
    title: "חלה קלועה",
    price: "20.00",
    discount_percentage: "10",
    category_id: 1,
    image: "wheat.png",
    in_stock: true,
    categories: { name: "חלה" }
  };

  const mockDbProducts = [
    mockDbProduct,
    {
      id: 2,
      title: "עוגת שוקולד",
      price: "50.00",
      discount_percentage: "20",
      category_id: 2,
      image: "cake.png",
      in_stock: true,
      categories: { name: "עוגות" }
    }
  ];

  const newProduct = {
    title: "ממתקים",
    price: 15,
    discountPercentage: 0,
    categoryId: 1,
    image: "candy.png",
    inStock: true,
    normalizeCategoryId: (val) => (typeof val === 'number' ? val : null)
  };

  const updatedProduct = {
    id: 1,
    title: "חלה משודרגת",
    price: 25,
    discountPercentage: 5,
    categoryId: 1,
    image: "wheat-upgraded.png",
    inStock: true,
    normalizeCategoryId: (val) => (typeof val === 'number' ? val : null)
  };

  beforeEach(() => {
    // Create a flexible mock Supabase client
    mockClient = vi.fn();
    mockClient.from = vi.fn().mockReturnThis();
    mockClient.select = vi.fn().mockReturnThis();
    mockClient.order = vi.fn().mockReturnThis();
    mockClient.eq = vi.fn().mockReturnThis();
    mockClient.single = vi.fn().mockReturnThis();
    mockClient.insert = vi.fn().mockReturnThis();
    mockClient.update = vi.fn().mockReturnThis();
    mockClient.delete = vi.fn().mockReturnThis();

    productService = new ProductService(mockClient);
  });

  describe("getAll", () => {
    it("fetches all products from database", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.order.mockResolvedValueOnce({ data: mockDbProducts, error: null });

      const result = await productService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("חלה קלועה");
      expect(result[1].title).toBe("עוגת שוקולד");
    });

    it("maps database rows to Product models", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.order.mockResolvedValueOnce({ data: [mockDbProduct], error: null });

      const result = await productService.getAll();

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("title");
      expect(result[0]).toHaveProperty("price");
      expect(result[0]).toHaveProperty("discountPercentage");
    });

    it("orders results by title", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.order.mockResolvedValueOnce({ data: mockDbProducts, error: null });

      await productService.getAll();

      expect(mockClient.order).toHaveBeenCalledWith("title");
    });

    it("returns empty array on database error", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.order.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" }
      });

      const result = await productService.getAll();

      expect(result).toEqual([]);
    });

    it("handles null data response", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.order.mockResolvedValueOnce({ data: null, error: null });

      const result = await productService.getAll();

      expect(result).toEqual([]);
    });

    it("includes categories in select query", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.order.mockResolvedValueOnce({ data: [], error: null });

      await productService.getAll();

      expect(mockClient.select).toHaveBeenCalledWith("*, categories(name)");
    });
  });

  describe("getById", () => {
    it("fetches single product by ID", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const result = await productService.getById(1);

      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
      expect(result.title).toBe("חלה קלועה");
    });

    it("maps database row to Product model", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const result = await productService.getById(1);

      expect(result.price).toBe(20);
      expect(result.discountPercentage).toBe(10);
    });

    it("filters by id", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      await productService.getById(1);

      expect(mockClient.eq).toHaveBeenCalledWith("id", 1);
    });

    it("returns null on database error", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" }
      });

      const result = await productService.getById(999);

      expect(result).toBeNull();
    });

    it("returns null when product not found", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: null, error: null });

      const result = await productService.getById(999);

      expect(result).toBeNull();
    });

    it("includes categories in select", async () => {
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      await productService.getById(1);

      expect(mockClient.select).toHaveBeenCalledWith("*, categories(name)");
    });
  });

  describe("create", () => {
    it("creates new product in database", async () => {
      const createdProduct = { ...mockDbProduct, id: 3 };
      mockClient.from.mockReturnThis();
      mockClient.insert.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: createdProduct, error: null });

      const result = await productService.create(newProduct);

      expect(result).not.toBeNull();
      expect(result.title).toBe("חלה קלועה");
    });

    it("maps product to database payload", async () => {
      mockClient.from.mockReturnThis();
      mockClient.insert.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      await productService.create(newProduct);

      expect(mockClient.insert).toHaveBeenCalled();
      const insertPayload = mockClient.insert.mock.calls[0][0];
      expect(insertPayload[0]).toHaveProperty("title");
      expect(insertPayload[0]).toHaveProperty("price");
    });

    it("returns null on database error", async () => {
      mockClient.from.mockReturnThis();
      mockClient.insert.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" }
      });

      const result = await productService.create(newProduct);

      expect(result).toBeNull();
    });

    it("uses normalizeCategoryId from product", async () => {
      mockClient.from.mockReturnThis();
      mockClient.insert.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const normalizer = vi.fn((val) => (typeof val === 'number' ? val : null));
      const productWithNormalizer = { ...newProduct, normalizeCategoryId: normalizer };

      await productService.create(productWithNormalizer);

      expect(normalizer).toHaveBeenCalled();
    });

    it("excludes id from insert payload", async () => {
      mockClient.from.mockReturnThis();
      mockClient.insert.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const productWithId = { ...newProduct, id: 999 };
      await productService.create(productWithId);

      const insertPayload = mockClient.insert.mock.calls[0][0];
      expect(insertPayload[0]).not.toHaveProperty("id");
    });
  });

  describe("update", () => {
    it("updates existing product", async () => {
      mockClient.from.mockReturnThis();
      mockClient.update.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const result = await productService.update(1, updatedProduct);

      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
    });

    it("filters by id for update", async () => {
      mockClient.from.mockReturnThis();
      mockClient.update.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      await productService.update(1, updatedProduct);

      expect(mockClient.eq).toHaveBeenCalledWith("id", 1);
    });

    it("returns null on database error", async () => {
      mockClient.from.mockReturnThis();
      mockClient.update.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Update failed" }
      });

      const result = await productService.update(1, updatedProduct);

      expect(result).toBeNull();
    });

    it("uses provided normalizeCategoryId or defaults to type check", async () => {
      mockClient.from.mockReturnThis();
      mockClient.update.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const productWithoutNormalizer = { ...updatedProduct };
      delete productWithoutNormalizer.normalizeCategoryId;

      await productService.update(1, productWithoutNormalizer);

      const updatePayload = mockClient.update.mock.calls[0][0];
      expect(updatePayload).toHaveProperty("category_id");
    });

    it("updates only specified fields", async () => {
      mockClient.from.mockReturnThis();
      mockClient.update.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: mockDbProduct, error: null });

      const partialUpdate = {
        title: "New Title",
        normalizeCategoryId: (val) => val
      };

      await productService.update(1, partialUpdate);

      const updatePayload = mockClient.update.mock.calls[0][0];
      expect(updatePayload.title).toBe("New Title");
    });
  });

  describe("delete", () => {
    it("deletes product by id", async () => {
      mockClient.from.mockReturnThis();
      mockClient.delete.mockReturnThis();
      mockClient.eq.mockResolvedValueOnce({ error: null });

      const result = await productService.delete(1);

      expect(result).toBe(true);
    });

    it("filters by id for delete", async () => {
      mockClient.from.mockReturnThis();
      mockClient.delete.mockReturnThis();
      mockClient.eq.mockResolvedValueOnce({ error: null });

      await productService.delete(1);

      expect(mockClient.eq).toHaveBeenCalledWith("id", 1);
    });

    it("returns false on database error", async () => {
      mockClient.from.mockReturnThis();
      mockClient.delete.mockReturnThis();
      mockClient.eq.mockResolvedValueOnce({ error: { message: "Delete failed" } });

      const result = await productService.delete(1);

      expect(result).toBe(false);
    });

    it("successfully deletes non-existent product (database responsibility)", async () => {
      mockClient.from.mockReturnThis();
      mockClient.delete.mockReturnThis();
      mockClient.eq.mockResolvedValueOnce({ error: null });

      const result = await productService.delete(999);

      expect(result).toBe(true);
    });

    it("accesses products table", async () => {
      mockClient.from.mockReturnThis();
      mockClient.delete.mockReturnThis();
      mockClient.eq.mockResolvedValueOnce({ error: null });

      await productService.delete(1);

      expect(mockClient.from).toHaveBeenCalledWith("products");
    });
  });

  describe("CRUD operations integration", () => {
    it("handles create and read cycle", async () => {
      const newProduct = {
        title: "New Product",
        price: 30,
        discountPercentage: 0,
        categoryId: 1,
        image: "new.png",
        inStock: true,
        normalizeCategoryId: (val) => val
      };

      // Create
      const createdDbProduct = { ...mockDbProduct, id: 3, title: "New Product" };
      mockClient.from.mockReturnThis();
      mockClient.insert.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: createdDbProduct, error: null });

      const created = await productService.create(newProduct);
      expect(created).not.toBeNull();

      // Read back
      mockClient.from.mockReturnThis();
      mockClient.select.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.single.mockResolvedValueOnce({ data: createdDbProduct, error: null });

      const retrieved = await productService.getById(3);
      expect(retrieved.id).toBe(3);
      expect(retrieved.title).toBe("New Product");
    });

    it("handles update and read cycle", async () => {
      const updated = { title: "Updated Title", normalizeCategoryId: (val) => val };

      mockClient.from.mockReturnThis();
      mockClient.update.mockReturnThis();
      mockClient.eq.mockReturnThis();
      mockClient.select.mockReturnThis();
      const updatedDbProduct = { ...mockDbProduct, title: "Updated Title" };
      mockClient.single.mockResolvedValueOnce({ data: updatedDbProduct, error: null });

      const result = await productService.update(1, updated);
      expect(result.title).toBe("Updated Title");
    });
  });
});
