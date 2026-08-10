/**
 * Room Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Room, ApiResponse } from '@/types/entities';

class RoomRepository extends BaseRepository<Room> {
  constructor() {
    super(STORES.ROOMS);
  }

  protected applySearchFilter(items: Room[], search: string): Room[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.floor?.toLowerCase().includes(searchLower) ||
        item.amenities?.some(amenity => 
          amenity.toLowerCase().includes(searchLower)
        )
    );
  }

  /**
   * Get rooms by location ID
   */
  async getByLocationId(locationId: string): Promise<ApiResponse<Room[]>> {
    try {
      const rooms = await this.getByIndex('locationId', locationId);
      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error: `Failed to fetch by location: ${error}` };
    }
  }

  /**
   * Get rooms by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<Room[]>> {
    try {
      const rooms = await this.getByIndex('companyId', companyId);
      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get rooms by status
   */
  async getByStatus(status: string): Promise<ApiResponse<Room[]>> {
    try {
      const rooms = await this.getByIndex('status', status);
      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error: `Failed to fetch by status: ${error}` };
    }
  }

  /**
   * Get rooms by type
   */
  async getByType(type: string): Promise<ApiResponse<Room[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const rooms = allResponse.data.filter(r => r.type === type);
      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error: `Failed to fetch by type: ${error}` };
    }
  }

  /**
   * Get available rooms for a location
   */
  async getAvailableByLocationId(locationId: string): Promise<ApiResponse<Room[]>> {
    try {
      const allResponse = await this.getByLocationId(locationId);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const availableRooms = allResponse.data.filter(r => r.status === 'active');
      return { success: true, data: availableRooms };
    } catch (error) {
      return { success: false, error: `Failed to fetch available rooms: ${error}` };
    }
  }

  /**
   * Get rooms with specific amenities
   */
  async getByAmenities(amenities: string[]): Promise<ApiResponse<Room[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const rooms = allResponse.data.filter(room => 
        amenities.every(amenity => 
          room.amenities?.includes(amenity)
        )
      );

      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error: `Failed to fetch by amenities: ${error}` };
    }
  }
}

export const roomRepository = new RoomRepository();