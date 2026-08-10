/**
 * Company Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Company, ApiResponse } from '@/types/entities';

class CompanyRepository extends BaseRepository<Company> {
  constructor() {
    super(STORES.COMPANIES);
  }

  protected applySearchFilter(items: Company[], search: string): Company[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get companies by plan
   */
  async getByPlan(plan: string): Promise<ApiResponse<Company[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const filtered = allResponse.data.filter(c => c.plan === plan);
      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, error: `Failed to fetch by plan: ${error}` };
    }
  }

  /**
   * Update location count for a company
   */
  async updateLocationCount(companyId: string, count: number): Promise<ApiResponse<Company>> {
    const companyResponse = await this.getById(companyId);
    
    if (!companyResponse.success || !companyResponse.data) {
      return { success: false, error: 'Company not found' };
    }

    const company = companyResponse.data;
    // Note: locationIds should be managed by the service layer
    return this.update(companyId, company);
  }
}

export const companyRepository = new CompanyRepository();
