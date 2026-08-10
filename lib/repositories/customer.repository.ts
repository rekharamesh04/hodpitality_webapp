/**
 * Customer Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Customer, CustomerFilter, ApiResponse } from '@/types/entities';

class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super(STORES.CUSTOMERS);
  }

  protected applySearchFilter(items: Customer[], search: string): Customer[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.phone.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get customers by location ID
   */
  async getByLocationId(locationId: string): Promise<ApiResponse<Customer[]>> {
    try {
      const customers = await this.getByIndex('locationId', locationId);
      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: `Failed to fetch by location: ${error}` };
    }
  }

  /**
   * Get customers by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<Customer[]>> {
    try {
      const customers = await this.getByIndex('companyId', companyId);
      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get customer by email
   */
  async getByEmail(email: string): Promise<ApiResponse<Customer>> {
    try {
      const customers = await this.getByIndex('email', email);
      const customer = customers[0];
      
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: `Failed to fetch by email: ${error}` };
    }
  }

  /**
   * Get customers with advanced filtering
   */
  async getFiltered(filter: CustomerFilter): Promise<ApiResponse<Customer[]>> {
    try {
      const allResponse = await this.getAll(filter);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      let customers = allResponse.data;

      // Apply location filter
      if (filter.locationId) {
        customers = customers.filter(c => c.locationId === filter.locationId);
      }

      // Apply membership tier filter
      if (filter.membershipTier) {
        customers = customers.filter(c => c.membershipTier === filter.membershipTier);
      }

      // Apply date filters
      if (filter.dateFrom) {
        customers = customers.filter(c => c.memberSince >= filter.dateFrom!);
      }

      if (filter.dateTo) {
        customers = customers.filter(c => c.memberSince <= filter.dateTo!);
      }

      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: `Failed to filter customers: ${error}` };
    }
  }

  /**
   * Get customers by membership tier
   */
  async getByMembershipTier(tier: string): Promise<ApiResponse<Customer[]>> {
    try {
      const customers = await this.getByIndex('membershipTier', tier);
      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: `Failed to fetch by membership tier: ${error}` };
    }
  }

  /**
   * Update customer visit count
   */
  async updateVisitCount(customerId: string, visits: number, lastVisit?: string): Promise<ApiResponse<Customer>> {
    const updateData: Partial<Customer> = { visits };
    if (lastVisit) {
      updateData.lastVisit = lastVisit;
    }
    return this.update(customerId, updateData);
  }

  /**
   * Update customer balance
   */
  async updateBalance(customerId: string, balance: number): Promise<ApiResponse<Customer>> {
    return this.update(customerId, { balance } as Partial<Customer>);
  }

  /**
   * Check if email exists (for validation)
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const customers = await this.getByIndex('email', email);
      if (excludeId) {
        return customers.some(c => c.id !== excludeId);
      }
      return customers.length > 0;
    } catch {
      return false;
    }
  }
}

export const customerRepository = new CustomerRepository();