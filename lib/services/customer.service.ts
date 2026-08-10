/**
 * Customer Service
 * 
 * Business logic for customer management
 */

import { 
  getCustomerRepository, 
  getLocationRepository, 
  getAppointmentRepository 
} from '@/lib/repositories';
import type { 
  Customer, 
  CustomerFilter, 
  CustomerProfile,
  Appointment,
  ApiResponse, 
  PaginatedResponse 
} from '@/types/entities';

// Lazy-initialized repository accessors
const customerRepository = getCustomerRepository();
const locationRepository = getLocationRepository();
const appointmentRepository = getAppointmentRepository();

class CustomerService {
  /**
   * Get all customers with pagination
   */
  async getCustomers(filter?: CustomerFilter): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return customerRepository.getPaginated(filter);
  }

  /**
   * Get customers with advanced filtering
   */
  async getFilteredCustomers(filter: CustomerFilter): Promise<ApiResponse<Customer[]>> {
    return customerRepository.getFiltered(filter);
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return customerRepository.getById(id);
  }

  /**
   * Get customer profile with appointments
   */
  async getCustomerProfile(id: string): Promise<ApiResponse<CustomerProfile>> {
    const customerResponse = await customerRepository.getById(id);
    
    if (!customerResponse.success || !customerResponse.data) {
      return { success: false, error: customerResponse.error };
    }

    // Get customer appointments
    const appointmentsResponse = await appointmentRepository.getByCustomerId(id);
    const appointments = appointmentsResponse.data || [];

    // Separate upcoming and historical appointments
    const now = new Date();
    const upcomingAppointments = appointments
      .filter(a => new Date(a.startTime) > now && a.status === 'scheduled')
      .slice(0, 5); // Limit to 5 upcoming

    const appointmentHistory = appointments
      .filter(a => new Date(a.startTime) <= now || ['completed', 'cancelled', 'no-show'].includes(a.status))
      .slice(0, 20); // Limit to 20 historical

    const profile: CustomerProfile = {
      ...customerResponse.data,
      upcomingAppointments,
      appointmentHistory,
      // Additional calculated fields could go here
    };

    return { success: true, data: profile };
  }

  /**
   * Create new customer
   */
  async createCustomer(data: {
    locationId: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    membershipTier: string;
    preferredTime?: string;
    communicationChannel: string;
    notes?: string;
  }): Promise<ApiResponse<Customer>> {
    // Validate required fields
    if (!data.name.trim()) {
      return { success: false, error: 'Customer name is required' };
    }

    if (!data.email.trim()) {
      return { success: false, error: 'Customer email is required' };
    }

    if (!data.phone.trim()) {
      return { success: false, error: 'Customer phone is required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check for duplicate email
    const emailExists = await customerRepository.emailExists(data.email);
    if (emailExists) {
      return { success: false, error: 'Email already exists' };
    }

    // Validate location exists
    const locationResponse = await locationRepository.getById(data.locationId);
    if (!locationResponse.success || !locationResponse.data) {
      return { success: false, error: 'Location not found' };
    }

    const customer = {
      ...data,
      companyId: locationResponse.data.companyId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      membershipTier: data.membershipTier as any,
      memberSince: new Date().toISOString(),
      communicationChannel: data.communicationChannel as any,
      visits: 0,
      status: 'active' as const,
    };

    const result = await customerRepository.create(customer);

    // Update location customer count
    if (result.success) {
      await this.updateLocationCustomerCount(data.locationId);
    }

    return result;
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    // Validate fields if provided
    if (data.name !== undefined && !data.name.trim()) {
      return { success: false, error: 'Customer name is required' };
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        return { success: false, error: 'Customer email is required' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check for duplicate email (excluding current customer)
      const emailExists = await customerRepository.emailExists(data.email, id);
      if (emailExists) {
        return { success: false, error: 'Email already exists' };
      }

      data.email = data.email.trim().toLowerCase();
    }

    if (data.phone !== undefined && !data.phone.trim()) {
      return { success: false, error: 'Customer phone is required' };
    }

    // Trim string fields
    if (data.name) data.name = data.name.trim();
    if (data.phone) data.phone = data.phone.trim();
    if (data.address) data.address = data.address.trim();

    return customerRepository.update(id, data);
  }

  /**
   * Delete customer (with validation)
   */
  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    // Check if customer has future appointments
    const upcomingResponse = await appointmentRepository.getUpcomingByCustomer(id);
    if (upcomingResponse.success && upcomingResponse.data && upcomingResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete customer with upcoming appointments. Please cancel appointments first.' 
      };
    }

    // Get customer to update location count
    const customerResponse = await customerRepository.getById(id);
    if (!customerResponse.success || !customerResponse.data) {
      return { success: false, error: 'Customer not found' };
    }

    const locationId = customerResponse.data.locationId;
    const deleteResponse = await customerRepository.delete(id);

    // Update location customer count
    if (deleteResponse.success) {
      await this.updateLocationCustomerCount(locationId);
    }

    return deleteResponse;
  }

  /**
   * Archive customer
   */
  async archiveCustomer(id: string): Promise<ApiResponse<Customer>> {
    return customerRepository.archive(id);
  }

  /**
   * Search customers
   */
  async searchCustomers(locationId: string, query: string): Promise<ApiResponse<Customer[]>> {
    const filter: CustomerFilter = {
      locationId,
      search: query,
      status: 'active',
    };

    const response = await customerRepository.getFiltered(filter);
    
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    // Limit results for performance
    return { success: true, data: response.data.slice(0, 20) };
  }

  /**
   * Get customers by location
   */
  async getCustomersByLocation(locationId: string): Promise<ApiResponse<Customer[]>> {
    return customerRepository.getByLocationId(locationId);
  }

  /**
   * Get customers by membership tier
   */
  async getCustomersByTier(tier: string, locationId?: string): Promise<ApiResponse<Customer[]>> {
    const response = await customerRepository.getByMembershipTier(tier);
    
    if (!response.success || !response.data) {
      return response;
    }

    let customers = response.data;
    
    // Filter by location if specified
    if (locationId) {
      customers = customers.filter(c => c.locationId === locationId);
    }

    return { success: true, data: customers };
  }

  /**
   * Update customer visit count after appointment
   */
  async recordVisit(customerId: string): Promise<ApiResponse<Customer>> {
    const customerResponse = await customerRepository.getById(customerId);
    
    if (!customerResponse.success || !customerResponse.data) {
      return { success: false, error: 'Customer not found' };
    }

    const customer = customerResponse.data;
    const newVisitCount = customer.visits + 1;
    const lastVisit = new Date().toISOString();

    return customerRepository.updateVisitCount(customerId, newVisitCount, lastVisit);
  }

  /**
   * Update customer balance
   */
  async updateBalance(customerId: string, amount: number): Promise<ApiResponse<Customer>> {
    return customerRepository.updateBalance(customerId, amount);
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(customerId: string): Promise<ApiResponse<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    lastAppointment?: string;
    averageVisitFrequency?: number;
  }>> {
    try {
      const appointmentsResponse = await appointmentRepository.getByCustomerId(customerId);
      const appointments = appointmentsResponse.data || [];

      const stats = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
        noShowAppointments: appointments.filter(a => a.status === 'no-show').length,
        lastAppointment: appointments.length > 0 ? appointments[0].startTime : undefined,
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: `Failed to get customer stats: ${error}` };
    }
  }

  /**
   * Update location customer count (internal helper)
   */
  private async updateLocationCustomerCount(locationId: string): Promise<void> {
    try {
      const customersResponse = await customerRepository.getByLocationId(locationId);
      const count = customersResponse.data?.filter(c => c.status === 'active').length || 0;
      await locationRepository.updateCustomerCount(locationId, count);
    } catch (error) {
      console.warn('Failed to update location customer count:', error);
    }
  }
}

export const customerService = new CustomerService();