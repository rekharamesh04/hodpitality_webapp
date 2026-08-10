/**
 * Base Repository
 * 
 * Provides common CRUD operations for all repositories.
 * This abstraction makes it easy to swap from IndexedDB to API calls later.
 */

import { db, type StoreName } from '@/lib/storage/indexeddb';
import type { ApiResponse, PaginatedResponse, BaseFilter, EntityStatus } from '@/types/entities';

export interface BaseEntity {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected storeName: StoreName) {}

  /**
   * Get all items (optionally filtered)
   */
  async getAll(filter?: BaseFilter): Promise<ApiResponse<T[]>> {
    try {
      let items = await db.getAll<T>(this.storeName);

      // Apply filters
      if (filter?.status) {
        items = items.filter(item => item.status === filter.status);
      }

      if (filter?.search) {
        items = this.applySearchFilter(items, filter.search);
      }

      // Apply sorting
      if (filter?.sortBy) {
        items = this.applySorting(items, filter.sortBy, filter.sortOrder || 'asc');
      }

      return { success: true, data: items };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch ${this.storeName}: ${error}`,
      };
    }
  }

  /**
   * Get paginated items
   */
  async getPaginated(filter: BaseFilter = {}): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      const allResponse = await this.getAll(filter);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const items = allResponse.data;
      const page = filter.page || 1;
      const pageSize = filter.pageSize || 10;
      const total = items.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      return {
        success: true,
        data: {
          data: items.slice(startIndex, endIndex),
          total,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch paginated ${this.storeName}: ${error}`,
      };
    }
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<ApiResponse<T>> {
    try {
      const item = await db.getById<T>(this.storeName, id);
      
      if (!item) {
        return { success: false, error: 'Item not found' };
      }

      return { success: true, data: item };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch item: ${error}`,
      };
    }
  }

  /**
   * Create new item
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<T>> {
    try {
      const now = new Date().toISOString();
      const id = this.generateId();

      const item: T = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      } as T;

      await db.put(this.storeName, item);

      return { success: true, data: item };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create item: ${error}`,
      };
    }
  }

  /**
   * Update existing item
   */
  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const existingResponse = await this.getById(id);
      
      if (!existingResponse.success || !existingResponse.data) {
        return { success: false, error: 'Item not found' };
      }

      const updated: T = {
        ...existingResponse.data,
        ...data,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      await db.put(this.storeName, updated);

      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update item: ${error}`,
      };
    }
  }

  /**
   * Delete item (hard delete)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const existingResponse = await this.getById(id);
      
      if (!existingResponse.success) {
        return { success: false, error: 'Item not found' };
      }

      await db.delete(this.storeName, id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete item: ${error}`,
      };
    }
  }

  /**
   * Archive item (soft delete)
   */
  async archive(id: string): Promise<ApiResponse<T>> {
    return this.update(id, { status: 'archived' } as Partial<T>);
  }

  /**
   * Restore archived item
   */
  async restore(id: string): Promise<ApiResponse<T>> {
    return this.update(id, { status: 'active' } as Partial<T>);
  }

  /**
   * Count items
   */
  async count(filter?: BaseFilter): Promise<ApiResponse<number>> {
    try {
      const allResponse = await this.getAll(filter);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      return { success: true, data: allResponse.data.length };
    } catch (error) {
      return {
        success: false,
        error: `Failed to count items: ${error}`,
      };
    }
  }

  /**
   * Get items by index
   */
  protected async getByIndex(indexName: string, indexValue: any): Promise<T[]> {
    return db.getByIndex<T>(this.storeName, indexName, indexValue);
  }

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Apply search filter - to be overridden by child classes
   */
  protected abstract applySearchFilter(items: T[], search: string): T[];

  /**
   * Apply sorting
   */
  protected applySorting(items: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] {
    return [...items].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      const order = sortOrder === 'asc' ? 1 : -1;

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }
}
