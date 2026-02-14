/**
 * Generic Data Service Interface
 * Defines standard CRUD operations for database entities
 */

export interface IDataService<T> {
  /**
   * Fetch all records
   */
  getAll(): Promise<T[]>;

  /**
   * Fetch a single record by ID
   */
  getById(id: number): Promise<T | null>;

  /**
   * Create a new record
   */
  create(data: Partial<T>): Promise<T | null>;

  /**
   * Update an existing record
   */
  update(id: number, data: Partial<T>): Promise<T | null>;

  /**
   * Delete a record
   */
  delete(id: number): Promise<boolean>;
}

/**
 * Query options for filtering and sorting
 */
export interface QueryOptions {
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}
