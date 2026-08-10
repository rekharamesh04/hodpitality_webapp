/**
 * Location Service
 * 
 * Business logic for location management
 */

import { getLocationRepository, getCompanyRepository, getCustomerRepository, getStaffRepository } from '@/lib/repositories';
import type { Location, ApiResponse, PaginatedResponse, BaseFilter } from '@/types/entities';

class LocationService {
  // Lazy-initialized repository accessors
  private get locationRepository() {
    return getLocationRepository();
  }

  private get companyRepository() {
    return getCompanyRepository();
  }

  private get customerRepository() {
    return getCustomerRepository();
  }

  private get staffRepository() {
    return getStaffRepository();
  }

  /**
   * Get all locations with pagination
   */
  async getLocations(filter?: BaseFilter): Promise<ApiResponse<PaginatedResponse<Location>>> {
    return this.locationRepository.getPaginated(filter);
  }

  /**
   * Get location by ID with statistics
   */
  async getLocationById(id: string): Promise<ApiResponse<Location & { 
    actualCustomerCount?: number;
    actualStaffCount?: number;
  }>> {
    const locationResponse = await this.locationRepository.getById(id);
    
    if (!locationResponse.success || !locationResponse.data) {
      return { success: false, error: locationResponse.error };
    }

    // Get actual counts
    const customersResponse = await this.customerRepository.getByLocationId(id);
    const staffResponse = await this.staffRepository.getByLocationId(id);

    return {
      success: true,
      data: {
        ...locationResponse.data,
        actualCustomerCount: customersResponse.data?.length || 0,
        actualStaffCount: staffResponse.data?.length || 0,
      },
    };
  }

  /**
   * Get locations by company ID
   */
  async getLocationsByCompanyId(companyId: string): Promise<ApiResponse<Location[]>> {
    return this.locationRepository.getByCompanyId(companyId);
  }

  /**
   * Create new location
   */
  async createLocation(data: {
    companyId: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    manager?: string;
  }): Promise<ApiResponse<Location>> {
    // Validate required fields
    if (!data.name.trim()) {
      return { success: false, error: 'Location name is required' };
    }

    if (!data.address.trim()) {
      return { success: false, error: 'Location address is required' };
    }

    // Validate company exists
    const companyResponse = await this.companyRepository.getById(data.companyId);
    if (!companyResponse.success || !companyResponse.data) {
      return { success: false, error: 'Company not found' };
    }

    // Check for duplicate name within company
    const existingResponse = await this.locationRepository.getByCompanyId(data.companyId);
    if (existingResponse.success && existingResponse.data) {
      const duplicate = existingResponse.data.find(
        l => l.name.toLowerCase() === data.name.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Location name already exists in this company' };
      }
    }

    const location = {
      ...data,
      name: data.name.trim(),
      address: data.address.trim(),
      status: 'active' as const,
      customerCount: 0,
      staffCount: 0,
    };

    const result = await this.locationRepository.create(location);

    // Update company's location IDs if creation was successful
    if (result.success && result.data) {
      const company = companyResponse.data;
      const updatedLocationIds = [...(company.locationIds || []), result.data.id];
      await this.companyRepository.update(data.companyId, { locationIds: updatedLocationIds });
    }

    return result;
  }

  /**
   * Update location
   */
  async updateLocation(id: string, data: Partial<Location>): Promise<ApiResponse<Location>> {
    // Get current location to validate company change
    const currentResponse = await this.locationRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Location not found' };
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return { success: false, error: 'Location name is required' };
      }

      // Check for duplicate name within company (excluding current location)
      const existingResponse = await this.locationRepository.getByCompanyId(currentResponse.data.companyId);
      if (existingResponse.success && existingResponse.data) {
        const duplicate = existingResponse.data.find(
          l => l.id !== id && l.name.toLowerCase() === data.name!.toLowerCase()
        );
        if (duplicate) {
          return { success: false, error: 'Location name already exists in this company' };
        }
      }

      data.name = data.name.trim();
    }

    // Validate address if provided
    if (data.address !== undefined && !data.address.trim()) {
      return { success: false, error: 'Location address is required' };
    }

    if (data.address) {
      data.address = data.address.trim();
    }

    return this.locationRepository.update(id, data);
  }

  /**
   * Delete location (with validation)
   */
  async deleteLocation(id: string): Promise<ApiResponse<void>> {
    // Get location details
    const locationResponse = await this.locationRepository.getById(id);
    if (!locationResponse.success || !locationResponse.data) {
      return { success: false, error: 'Location not found' };
    }

    const location = locationResponse.data;

    // Check if location has customers
    const customersResponse = await this.customerRepository.getByLocationId(id);
    if (customersResponse.success && customersResponse.data && customersResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete location with existing customers. Please transfer or delete all customers first.' 
      };
    }

    // Check if location has staff
    const staffResponse = await this.staffRepository.getByLocationId(id);
    if (staffResponse.success && staffResponse.data && staffResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete location with existing staff. Please transfer or delete all staff first.' 
      };
    }

    // Delete location
    const deleteResponse = await this.locationRepository.delete(id);

    // Update company's location IDs if deletion was successful
    if (deleteResponse.success) {
      const companyResponse = await this.companyRepository.getById(location.companyId);
      if (companyResponse.success && companyResponse.data) {
        const updatedLocationIds = companyResponse.data.locationIds.filter(locId => locId !== id);
        await this.companyRepository.update(location.companyId, { locationIds: updatedLocationIds });
      }
    }

    return deleteResponse;
  }

  /**
   * Archive location
   */
  async archiveLocation(id: string): Promise<ApiResponse<Location>> {
    return this.locationRepository.archive(id);
  }

  /**
   * Update location statistics
   */
  async updateLocationStats(locationId: string): Promise<ApiResponse<Location>> {
    // Get actual counts
    const customersResponse = await this.customerRepository.getByLocationId(locationId);
    const staffResponse = await this.staffRepository.getByLocationId(locationId);

    const customerCount = customersResponse.data?.length || 0;
    const staffCount = staffResponse.data?.length || 0;

    return this.locationRepository.update(locationId, { customerCount, staffCount });
  }

  /**
   * Get location statistics
   */
  async getLocationStats(locationId: string): Promise<ApiResponse<{
    customerCount: number;
    staffCount: number;
    activeCustomers: number;
    activeStaff: number;
    todayAppointments: number;
  }>> {
    try {
      const customersResponse = await this.customerRepository.getByLocationId(locationId);
      const staffResponse = await this.staffRepository.getByLocationId(locationId);

      const customers = customersResponse.data || [];
      const staff = staffResponse.data || [];

      return {
        success: true,
        data: {
          customerCount: customers.length,
          staffCount: staff.length,
          activeCustomers: customers.filter(c => c.status === 'active').length,
          activeStaff: staff.filter(s => s.status === 'active').length,
          todayAppointments: 0, // Would be calculated from appointment service
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to get location stats: ${error}` };
    }
  }
}

export const locationService = new LocationService();