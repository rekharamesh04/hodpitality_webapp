/**
 * Location Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Location, ApiResponse } from '@/types/entities';

class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super(STORES.LOCATIONS);
  }

  protected applySearchFilter(items: Location[], search: string): Location[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.address.toLowerCase().includes(searchLower) ||
        item.city?.toLowerCase().includes(searchLower) ||
        item.manager?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get locations by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<Location[]>> {
    try {
      const locations = await this.getByIndex('companyId', companyId);
      return { success: true, data: locations };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get locations by status
   */
  async getByStatus(status: string): Promise<ApiResponse<Location[]>> {
    try {
      const locations = await this.getByIndex('status', status);
      return { success: true, data: locations };
    } catch (error) {
      return { success: false, error: `Failed to fetch by status: ${error}` };
    }
  }

  /**
   * Update customer count for a location
   */
  async updateCustomerCount(locationId: string, count: number): Promise<ApiResponse<Location>> {
    return this.update(locationId, { customerCount: count } as Partial<Location>);
  }

  /**
   * Update staff count for a location
   */
  async updateStaffCount(locationId: string, count: number): Promise<ApiResponse<Location>> {
    return this.update(locationId, { staffCount: count } as Partial<Location>);
  }
}

export const locationRepository = new LocationRepository();