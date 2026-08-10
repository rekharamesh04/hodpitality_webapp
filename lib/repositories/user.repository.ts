/**
 * User Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { User, ApiResponse } from '@/types/entities';

class UserRepository extends BaseRepository<User> {
  constructor() {
    super(STORES.USERS);
  }

  protected applySearchFilter(items: User[], search: string): User[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.phone?.toLowerCase().includes(searchLower) ||
        item.role.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get user by email (for authentication)
   */
  async getByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const user = allResponse.data.find(u => u.email === email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: `Failed to fetch by email: ${error}` };
    }
  }

  /**
   * Get users by role
   */
  async getByRole(role: string): Promise<ApiResponse<User[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const users = allResponse.data.filter(u => u.role === role);
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: `Failed to fetch by role: ${error}` };
    }
  }

  /**
   * Get users by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<User[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const users = allResponse.data.filter(u => u.companyId === companyId);
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get users by location ID
   */
  async getByLocationId(locationId: string): Promise<ApiResponse<User[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const users = allResponse.data.filter(u => u.locationId === locationId);
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: `Failed to fetch by location: ${error}` };
    }
  }

  /**
   * Check if email exists (for validation)
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return false;
      }

      const users = allResponse.data.filter(u => u.email === email);
      if (excludeId) {
        return users.some(u => u.id !== excludeId);
      }
      return users.length > 0;
    } catch {
      return false;
    }
  }
}

export const userRepository = new UserRepository();