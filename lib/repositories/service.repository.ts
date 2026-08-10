/**
 * Service Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Service, ApiResponse } from '@/types/entities';

class ServiceRepository extends BaseRepository<Service> {
  constructor() {
    super(STORES.SERVICES);
  }

  protected applySearchFilter(items: Service[], search: string): Service[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.requirements?.some(req => 
          req.toLowerCase().includes(searchLower)
        )
    );
  }

  /**
   * Get services by location ID
   */
  async getByLocationId(locationId: string): Promise<ApiResponse<Service[]>> {
    try {
      const services = await this.getByIndex('locationId', locationId);
      return { success: true, data: services };
    } catch (error) {
      return { success: false, error: `Failed to fetch by location: ${error}` };
    }
  }

  /**
   * Get services by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<Service[]>> {
    try {
      const services = await this.getByIndex('companyId', companyId);
      return { success: true, data: services };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get services by status
   */
  async getByStatus(status: string): Promise<ApiResponse<Service[]>> {
    try {
      const services = await this.getByIndex('status', status);
      return { success: true, data: services };
    } catch (error) {
      return { success: false, error: `Failed to fetch by status: ${error}` };
    }
  }

  /**
   * Get services by category
   */
  async getByCategory(category: string): Promise<ApiResponse<Service[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const services = allResponse.data.filter(s => 
        s.category?.toLowerCase() === category.toLowerCase()
      );
      return { success: true, data: services };
    } catch (error) {
      return { success: false, error: `Failed to fetch by category: ${error}` };
    }
  }

  /**
   * Get services by room ID
   */
  async getByRoomId(roomId: string): Promise<ApiResponse<Service[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const services = allResponse.data.filter(s => s.roomId === roomId);
      return { success: true, data: services };
    } catch (error) {
      return { success: false, error: `Failed to fetch by room: ${error}` };
    }
  }

  /**
   * Get services by duration range
   */
  async getByDurationRange(minDuration: number, maxDuration: number): Promise<ApiResponse<Service[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const services = allResponse.data.filter(s => 
        s.duration >= minDuration && s.duration <= maxDuration
      );
      return { success: true, data: services };
    } catch (error) {
      return { success: false, error: `Failed to fetch by duration: ${error}` };
    }
  }

  /**
   * Get available services for a location
   */
  async getAvailableByLocationId(locationId: string): Promise<ApiResponse<Service[]>> {
    try {
      const allResponse = await this.getByLocationId(locationId);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const availableServices = allResponse.data.filter(s => s.status === 'active');
      return { success: true, data: availableServices };
    } catch (error) {
      return { success: false, error: `Failed to fetch available services: ${error}` };
    }
  }
}

export const serviceRepository = new ServiceRepository();