import type { Category } from '../types/models';

export class CategoryResolver {
  /**
   * Get category name by ID
   */
  static getCategoryName(categories: Category[], categoryId: string | number | null): string {
    if (categoryId === null) return'ללא קטגוריה';
    const category = categories.find((c) => String(c.id) === String(categoryId) || c.category_id === categoryId);
    return category?.category_name || 'ללא קטגוריה';
  }

  /**
   * Get category thumbnail URL by ID
   */
  static getCategoryThumbnail(categories: Category[], categoryId: string | number | null): string {
    if (categoryId === null) return 'all_categories.png';
    const category = categories.find((c) => String(c.id) === String(categoryId) || c.category_id === categoryId);
    const imageUrl = category?.image_url || 'all_categories.png';
    // Strip "assets/" prefix if present (for backward compatibility with old data)
    return imageUrl.startsWith('assets/') ? imageUrl.substring(7) : imageUrl;
  }

  /**
   * Resolve category ID from various inputs (ID, name, or numeric string)
   */
  static resolveCategoryId(
    categories: Category[],
    input: number | string
  ): number | null {
    // If it's already a number, validate it exists
    if (typeof input === 'number') {
      const exists = categories.some((c) => c.id === input);
      return exists ? input : null;
    }

    // If it's a numeric string, convert to number
    const numericId = Number(input);
    if (!isNaN(numericId) && numericId > 0) {
      const exists = categories.some((c) => c.id === numericId);
      return exists ? numericId : null;
    }

    // Try to find by name
    const category = categories.find(
      (c) => c.category_name.toLowerCase() === input.toLowerCase()
    );
    
    return category ? (category.id ?? null) : null;
  }

  /**
   * Get all category IDs
   */
  static getAllCategoryIds(categories: Category[]): number[] {
    return categories.map((c) => c.id).filter((id): id is number => id !== undefined);
  }

  /**
   * Check if category exists
   */
  static categoryExists(categories: Category[], categoryId: number): boolean {
    return categories.some((c) => c.id === categoryId);
  }

  /**
   * Get category by ID
   */
  static getCategoryById(categories: Category[], categoryId: number): Category | null {
    return categories.find((c) => c.id === categoryId) || null;
  }
}
