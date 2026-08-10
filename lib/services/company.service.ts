/**
 * Company Service
 * 
 * Business logic for company management
 */

import { getCompanyRepository, getLocationRepository } from '@/lib/repositories';
import type { Company, Location, ApiResponse, PaginatedResponse, BaseFilter } from '@/types/entities';

class CompanyService {
  // Lazy-initialized repository accessors
  private get companyRepository() {
    return getCompanyRepository();
  }

  private get locationRepository() {
    return getLocationRepository();
  }
  /**
   * Get all companies with pagination
   */
  async getCompanies(filter?: BaseFilter): Promise<ApiResponse<PaginatedResponse<Company>>> {
    return this.companyRepository.getPaginated(filter);
  }

  /**
   * Get company by ID with location details
   */
  async getCompanyById(id: string): Promise<ApiResponse<Company & { locations?: Location[] }>> {
    const companyResponse = await this.companyRepository.getById(id);
    
    if (!companyResponse.success || !companyResponse.data) {
      return { success: false, error: companyResponse.error };
    }

    // Get company locations
    const locationsResponse = await this.locationRepository.getByCompanyId(id);
    
    return {
      success: true,
      data: {
        ...companyResponse.data,
        locations: locationsResponse.data || [],
      },
    };
  }

  /**
   * Create new company
   */
  async createCompany(data: {
    name: string;
    plan: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
  }): Promise<ApiResponse<Company>> {
    // Validate required fields
    if (!data.name.trim()) {
      return { success: false, error: 'Company name is required' };
    }

    // Check for duplicate name
    const existingResponse = await this.companyRepository.getAll();
    if (existingResponse.success && existingResponse.data) {
      const duplicate = existingResponse.data.find(
        c => c.name.toLowerCase() === data.name.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Company name already exists' };
      }
    }

    const company = {
      ...data,
      name: data.name.trim(),
      plan: data.plan as any,
      status: 'active' as const,
      locationIds: [],
    };

    return this.companyRepository.create(company);
  }

  /**
   * Update company
   */
  async updateCompany(id: string, data: Partial<Company>): Promise<ApiResponse<Company>> {
    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return { success: false, error: 'Company name is required' };
      }

      // Check for duplicate name (excluding current company)
      const existingResponse = await this.companyRepository.getAll();
      if (existingResponse.success && existingResponse.data) {
        const duplicate = existingResponse.data.find(
          c => c.id !== id && c.name.toLowerCase() === data.name!.toLowerCase()
        );
        if (duplicate) {
          return { success: false, error: 'Company name already exists' };
        }
      }

      data.name = data.name.trim();
    }

    return this.companyRepository.update(id, data);
  }

  /**
   * Delete company (with validation)
   */
  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    // Check if company has locations
    const locationsResponse = await this.locationRepository.getByCompanyId(id);
    
    if (locationsResponse.success && locationsResponse.data && locationsResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete company with existing locations. Please delete all locations first.' 
      };
    }

    return this.companyRepository.delete(id);
  }

  /**
   * Archive company
   */
  async archiveCompany(id: string): Promise<ApiResponse<Company>> {
    return this.companyRepository.archive(id);
  }

  /**
   * Get companies by plan
   */
  async getCompaniesByPlan(plan: string): Promise<ApiResponse<Company[]>> {
    return this.companyRepository.getByPlan(plan);
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId: string): Promise<ApiResponse<{
    locationCount: number;
    customerCount: number;
    staffCount: number;
    totalAppointments: number;
  }>> {
    try {
      // Get locations
      const locationsResponse = await this.locationRepository.getByCompanyId(companyId);
      const locationCount = locationsResponse.data?.length || 0;

      // For detailed stats, we'd need to aggregate from other services
      // This is a simplified version
      return {
        success: true,
        data: {
          locationCount,
          customerCount: 0,
          staffCount: 0,
          totalAppointments: 0,
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to get company stats: ${error}` };
    }
  }
}

export const companyService = new CompanyService();