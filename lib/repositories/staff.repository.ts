/**
 * Staff Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Staff, StaffFilter, ApiResponse } from '@/types/entities';

class StaffRepository extends BaseRepository<Staff> {
  constructor() {
    super(STORES.STAFF);
  }

  protected applySearchFilter(items: Staff[], search: string): Staff[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.phone.toLowerCase().includes(searchLower) ||
        item.role.toLowerCase().includes(searchLower) ||
        item.specializations?.some(spec => 
          spec.toLowerCase().includes(searchLower)
        )
    );
  }

  /**
   * Get staff by location ID
   */
  async getByLocationId(locationId: string): Promise<ApiResponse<Staff[]>> {
    try {
      const staff = await this.getByIndex('locationId', locationId);
      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: `Failed to fetch by location: ${error}` };
    }
  }

  /**
   * Get staff by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<Staff[]>> {
    try {
      const staff = await this.getByIndex('companyId', companyId);
      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get staff by email
   */
  async getByEmail(email: string): Promise<ApiResponse<Staff>> {
    try {
      const staff = await this.getByIndex('email', email);
      const member = staff[0];
      
      if (!member) {
        return { success: false, error: 'Staff member not found' };
      }

      return { success: true, data: member };
    } catch (error) {
      return { success: false, error: `Failed to fetch by email: ${error}` };
    }
  }

  /**
   * Get staff with advanced filtering
   */
  async getFiltered(filter: StaffFilter): Promise<ApiResponse<Staff[]>> {
    try {
      const allResponse = await this.getAll(filter);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      let staff = allResponse.data;

      // Apply location filter
      if (filter.locationId) {
        staff = staff.filter(s => s.locationId === filter.locationId);
      }

      // Apply role filter
      if (filter.role) {
        staff = staff.filter(s => s.role.toLowerCase().includes(filter.role!.toLowerCase()));
      }

      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: `Failed to filter staff: ${error}` };
    }
  }

  /**
   * Get staff assigned to a specific room
   */
  async getByRoomAssignment(roomId: string): Promise<ApiResponse<Staff[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const staff = allResponse.data.filter(s => 
        s.roomAssignments?.includes(roomId)
      );

      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: `Failed to fetch by room assignment: ${error}` };
    }
  }

  /**
   * Get staff by role
   */
  async getByRole(role: string): Promise<ApiResponse<Staff[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const staff = allResponse.data.filter(s => 
        s.role.toLowerCase() === role.toLowerCase()
      );

      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: `Failed to fetch by role: ${error}` };
    }
  }

  /**
   * Check if email exists (for validation)
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const staff = await this.getByIndex('email', email);
      if (excludeId) {
        return staff.some(s => s.id !== excludeId);
      }
      return staff.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Update room assignments
   */
  async updateRoomAssignments(staffId: string, roomIds: string[]): Promise<ApiResponse<Staff>> {
    return this.update(staffId, { roomAssignments: roomIds } as Partial<Staff>);
  }
}

export const staffRepository = new StaffRepository();