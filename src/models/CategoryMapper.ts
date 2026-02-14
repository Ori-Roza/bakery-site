/**
 * Category ID normalization and resolution
 */

import type { Category } from '../types/models';

export class CategoryMapper {
  /**
   * Normalize category ID from various input formats
   * Accepts: number, string number, or category name
   * Returns: numeric ID or null
   */
  static normalizeCategoryId(value: any, categories: Category[]): number | null {
    console.log("[normalizeCategoryId] Input:", value, "Type:", typeof value);

    if (value === null || value === undefined || value === "") {
      console.log("[normalizeCategoryId] Value is null/undefined/empty, returning null");
      return null;
    }

    // Try converting to number
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      console.log("[normalizeCategoryId] Converted to number:", asNumber);
      return asNumber;
    }

    // Try looking up by name
    const match = categories.find((item) => item.category_name === value);
    console.log("[normalizeCategoryId] Looked up by name, found:", match);
    return match ? (typeof match.category_id === 'string' ? Number(match.category_id) : match.category_id) : null;
  }

  /**
   * Normalize product ID to number
   */
  static normalizeProductId(value: any): number | null {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : null;
  }

  /**
   * Get category thumbnail image URL
   */
  static getCategoryThumbnail(categoryId: number | null, categories: Category[]): string {
    if (!categoryId) {
      return "all_categories.png";
    }

    const category = categories.find(
      (item) => String(item.category_id) === String(categoryId)
    );

    if (category?.image_url) {
      // Strip "assets/" prefix if present (for backward compatibility)
      const imageUrl = category.image_url;
      return imageUrl.startsWith('assets/') ? imageUrl.substring(7) : imageUrl;
    }

    return "all_categories.png";
  }
}

/**
 * Convenience functions for backward compatibility
 */
export const normalizeCategoryId = (value: any, categories: Category[]) =>
  CategoryMapper.normalizeCategoryId(value, categories);
export const normalizeProductId = CategoryMapper.normalizeProductId;
export const getCategoryThumbnail = (categoryId: number | null, categories: Category[]) =>
  CategoryMapper.getCategoryThumbnail(categoryId, categories);
