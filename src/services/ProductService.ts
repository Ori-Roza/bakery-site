/**
 * Product Service
 * Handles all product-related database operations
 */

import type { Product, ProductDbRow } from '../types/models';
import type { IDataService } from './IDataService';
import type { SupabaseClient } from './SupabaseClient';
import { ProductMapper } from '../models/ProductMapper';

export class ProductService implements IDataService<Product> {
  constructor(private client: SupabaseClient) {}

  async getAll(): Promise<Product[]> {
    const { data, error } = await this.client
      .from("products")
      .select("*, categories(name)")
      .order("title");

    if (error) {
      console.error("[ProductService] Error fetching products:", error);
      return [];
    }

    return (data || []).map((row: any) => ProductMapper.mapDbToProduct(row as ProductDbRow));
  }

  async getById(id: number): Promise<Product | null> {
    const { data, error } = await this.client
      .from("products")
      .select("*, categories(name)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[ProductService] Error fetching product:", error);
      return null;
    }

    return data ? ProductMapper.mapDbToProduct(data as ProductDbRow) : null;
  }

  async create(product: Partial<Product> & { normalizeCategoryId: (val: any) => number | null }): Promise<Product | null> {
    const { normalizeCategoryId, ...productData } = product;
    const payload = ProductMapper.mapProductToDb(productData as any, { 
      includeId: false,
      normalizeCategoryId 
    });

    const { data, error } = await this.client
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[ProductService] Error creating product:", error);
      return null;
    }

    return data ? ProductMapper.mapDbToProduct(data as ProductDbRow) : null;
  }

  async update(id: number, product: Partial<Product> & { normalizeCategoryId?: (val: any) => number | null }): Promise<Product | null> {
    const { normalizeCategoryId, ...productData } = product;
    const payload = ProductMapper.mapProductToDb({ ...productData, id } as any, { 
      includeId: false,
      normalizeCategoryId: normalizeCategoryId || ((val: any) => typeof val === 'number' ? val : null)
    });

    const { data, error } = await this.client
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[ProductService] Error updating product:", error);
      return null;
    }

    return data ? ProductMapper.mapDbToProduct(data as ProductDbRow) : null;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await this.client
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[ProductService] Error deleting product:", error);
      return false;
    }

    return true;
  }
}
