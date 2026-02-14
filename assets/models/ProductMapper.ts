/**
 * Product data mapping between database and application models
 */

import type { Product, ProductDbRow, Category } from '../types/models';

export class ProductMapper {
  /**
   * Map database row to Product model
   */
  static mapDbToProduct(row: ProductDbRow): Product {
    return {
      id: row.id,
      title: row.title,
      price: Number(row.price),
      discountPercentage: Number(row.discount_percentage) || 0,
      categoryId: row.category_id || row.categoryId || null,
      categoryName: row.categories?.name || row.category || "",
      image: row.image,
      inStock: row.in_stock,
    };
  }

  /**
   * Map Product model to database payload
   */
  static mapProductToDb(
    product: Partial<Product> & { id?: number },
    options: { includeId?: boolean; normalizeCategoryId: (value: any) => number | null } = {
      includeId: false,
      normalizeCategoryId: (val) => (typeof val === 'number' ? val : null)
    }
  ): any {
    const payload: any = {
      title: product.title,
      price: product.price,
      discount_percentage: product.discountPercentage || 0,
      category_id: options.normalizeCategoryId(
        product.categoryId || (product as any).category_id || null
      ),
      image: product.image,
      in_stock: product.inStock,
    };

    if (options.includeId && product.id !== undefined) {
      const numericId = Number(product.id);
      if (Number.isFinite(numericId)) {
        payload.id = numericId;
      }
    }

    return payload;
  }

  /**
   * Get category label for a product
   */
  static getCategoryLabel(product: Product, categories: Category[]): string {
    if (product.categoryName || (product as any).category) {
      return product.categoryName || (product as any).category || "";
    }

    const category = categories.find(
      (item) => String(item.category_id) === String(product.categoryId)
    );

    return category?.category_name || "";
  }
}

/**
 * Convenience functions for backward compatibility
 */
export const mapDbToProduct = ProductMapper.mapDbToProduct;
export const mapProductToDb = (product: any, options?: any) => 
  ProductMapper.mapProductToDb(product, options);
export const getCategoryLabel = (product: Product, categories: Category[]) =>
  ProductMapper.getCategoryLabel(product, categories);
