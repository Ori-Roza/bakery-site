/**
 * Storage Service
 * Handles file uploads to Supabase Storage
 */

import type { SupabaseClient } from './SupabaseClient';
import { sanitizeFileName } from '../utils/data-converters';

export class StorageService {
  constructor(private client: SupabaseClient) {}

  /**
   * Upload product image
   */
  async uploadProductImage(file: File, prefix: string): Promise<string | null> {
    if (!file) return null;

    const ext = file.name.split(".").pop();
    const sanitizedPrefix = sanitizeFileName(prefix);
    const fileName = `${sanitizedPrefix}-${Date.now()}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error } = await this.client
      .storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("[StorageService] Upload error:", error);
      return null;
    }

    const { data } = this.client.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(file: File, prefix: string): Promise<string | null> {
    if (!file) return null;

    const ext = file.name.split(".").pop();
    const sanitizedPrefix = sanitizeFileName(prefix);
    const fileName = `${sanitizedPrefix}-${Date.now()}.${ext}`;
    const filePath = `categories/${fileName}`;

    const { error } = await this.client
      .storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("[StorageService] Upload error:", error);
      return null;
    }

    const { data } = this.client.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Upload hero image
   */
  async uploadHeroImage(file: File): Promise<string | null> {
    if (!file) return null;

    const ext = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${ext}`;
    const filePath = `site/${fileName}`;

    const { error } = await this.client
      .storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("[StorageService] Upload error:", error);
      return null;
    }

    const { data } = this.client.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Upload logo image
   */
  async uploadLogoImage(file: File): Promise<string | null> {
    if (!file) return null;

    const ext = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${ext}`;
    const filePath = `site/${fileName}`;

    const { error } = await this.client
      .storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("[StorageService] Upload error:", error);
      return null;
    }

    const { data } = this.client.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
