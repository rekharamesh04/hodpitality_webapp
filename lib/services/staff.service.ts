/**
 * Staff Service
 * 
 * Business logic for staff management
 */

import { 
  getStaffRepository,
  getLocationRepository,
  getAppointmentRepository 
} from '@/lib/repositories';
import type { 
  Staff, 
  StaffFilter,
  ApiResponse, 
  PaginatedResponse 
} from '@/types/entities';

// Lazy-initialized repository accessors
const staffRepository = getStaffRepository();
const locationRepository = getLocationRepository();
const appointmentRepository = getAppointmentRepository();

class StaffService {
  /**
   * Get all staff with pagination
   */
  async getStaff(filter?: StaffFilter): Promise<ApiResponse<PaginatedResponse<Staff>>> {
    return staffRepository.getPaginated(filter);
  }

  /**
   * Get staff with advanced filtering
   */
  async getFilteredStaff(filter: StaffFilter): Promise<ApiResponse<Staff[]>> {
    return staffRepository.getFiltered(filter);
  }

  /**
   * Get staff by ID
   */
  async getStaffById(id: string): Promise<ApiResponse<Staff>> {
    return staffRepository.getById(id);
  }

  /**
   * Get staff by location
   */
  async getStaffByLocation(locationId: string): Promise<ApiResponse<Staff[]>> {
    return staffRepository.getByLocationId(locationId);
  }

  /**
   * Create new staff member
   */
  async createStaff(data: {
    locationId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    roomAssignments?: string[];
    specializations?: string[];
  }): Promise<ApiResponse<Staff>> {
    // Validate required fields
    if (!data.name.trim()) {
      return { success: false, error: 'Staff name is required' };
    }

    if (!data.email.trim()) {
      return { success: false, error: 'Staff email is required' };
    }

    if (!data.phone.trim()) {
      return { success: false, error: 'Staff phone is required' };
    }

    if (!data.role.trim()) {
      return { success: false, error: 'Staff role is required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check for duplicate email
    const emailExists = await staffRepository.emailExists(data.email);
    if (emailExists) {
      return { success: false, error: 'Email already exists' };
    }

    // Validate location exists
    const locationResponse = await locationRepository.getById(data.locationId);
    if (!locationResponse.success || !locationResponse.data) {
      return { success: false, error: 'Location not found' };
    }

    const staff = {
      ...data,
      companyId: locationResponse.data.companyId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: data.role.trim(),
      status: 'active' as const,
      joinedDate: new Date().toISOString(),
    };

    const result = await staffRepository.create(staff);

    // Update location staff count
    if (result.success) {
      await this.updateLocationStaffCount(data.locationId);
    }

    return result;
  }

  /**
   * Update staff member
   */
  async updateStaff(id: string, data: Partial<Staff>): Promise<ApiResponse<Staff>> {
    // Validate fields if provided
    if (data.name !== undefined && !data.name.trim()) {
      return { success: false, error: 'Staff name is required' };
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        return { success: false, error: 'Staff email is required' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check for duplicate email (excluding current staff)
      const emailExists = await staffRepository.emailExists(data.email, id);
      if (emailExists) {
        return { success: false, error: 'Email already exists' };
      }

      data.email = data.email.trim().toLowerCase();
    }

    if (data.phone !== undefined && !data.phone.trim()) {
      return { success: false, error: 'Staff phone is required' };
    }

    if (data.role !== undefined && !data.role.trim()) {
      return { success: false, error: 'Staff role is required' };
    }

    // Trim string fields
    if (data.name) data.name = data.name.trim();
    if (data.phone) data.phone = data.phone.trim();
    if (data.role) data.role = data.role.trim();

    return staffRepository.update(id, data);
  }

  /**
   * Delete staff member (with validation)
   */
  async deleteStaff(id: string): Promise<ApiResponse<void>> {
    // Check if staff has future appointments
    const today = new Date().toISOString().split('T')[0];
    const futureAppointmentsResponse = await appointmentRepository.getFiltered({
      staffId: id,
      dateFrom: today,
      status: 'scheduled',
    });

    if (futureAppointmentsResponse.success && 
        futureAppointmentsResponse.data && 
        futureAppointmentsResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete staff member with future appointments. Please reassign appointments first.' 
      };
    }

    // Get staff to update location count
    const staffResponse = await staffRepository.getById(id);
    if (!staffResponse.success || !staffResponse.data) {
      return { success: false, error: 'Staff member not found' };
    }

    const locationId = staffResponse.data.locationId;
    const deleteResponse = await staffRepository.delete(id);

    // Update location staff count
    if (deleteResponse.success) {
      await this.updateLocationStaffCount(locationId);
    }

    return deleteResponse;
  }

  /**
   * Archive staff member
   */
  async archiveStaff(id: string): Promise<ApiResponse<Staff>> {
    const result = await staffRepository.archive(id);

    // Update location staff count
    if (result.success && result.data) {
      await this.updateLocationStaffCount(result.data.locationId);
    }

    return result;
  }

  /**
   * Get staff by role
   */
  async getStaffByRole(role: string, locationId?: string): Promise<ApiResponse<Staff[]>> {
    const response = await staffRepository.getByRole(role);
    
    if (!response.success || !response.data) {
      return response;
    }

    let staff = response.data;
    
    // Filter by location if specified
    if (locationId) {
      staff = staff.filter(s => s.locationId === locationId);
    }

    return { success: true, data: staff };
  }

  /**
   * Update room assignments
   */
  async updateRoomAssignments(staffId: string, roomIds: string[]): Promise<ApiResponse<Staff>> {
    return staffRepository.updateRoomAssignments(staffId, roomIds);
  }

  /**
   * Search staff members
   */
  async searchStaff(locationId: string, query: string): Promise<ApiResponse<Staff[]>> {
    const filter: StaffFilter = {
      locationId,
      search: query,
      status: 'active',
    };

    const response = await staffRepository.getFiltered(filter);
    
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    // Limit results for performance
    return { success: true, data: response.data.slice(0, 20) };
  }

  /**
   * Get staff availability for a specific date
   */
  async getStaffAvailability(staffId: string, date: string): Promise<ApiResponse<{
    available: boolean;
    appointments: any[];
    workingHours: { start: string; end: string };
  }>> {
    try {
      // Get staff member
      const staffResponse = await staffRepository.getById(staffId);
      if (!staffResponse.success || !staffResponse.data) {
        return { success: false, error: 'Staff member not found' };
      }

      // Get appointments for the date
      const appointmentsResponse = await appointmentRepository.getFiltered({
        staffId,
        date,
        status: 'scheduled',
      });

      const appointments = appointmentsResponse.data || [];

      // Simplified working hours (9 AM to 6 PM)
      const workingHours = { start: '09:00', end: '18:00' };

      return {
        success: true,
        data: {
          available: appointments.length < 8, // Simplified availability check
          appointments,
          workingHours,
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to get staff availability: ${error}` };
    }
  }

  /**
   * Get staff statistics
   */
  async getStaffStats(staffId: string): Promise<ApiResponse<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    upcomingAppointments: number;
    averageRating?: number;
  }>> {
    try {
      const appointmentsResponse = await appointmentRepository.getByStaffId(staffId);
      const appointments = appointmentsResponse.data || [];

      const now = new Date();
      const upcoming = appointments.filter(a => 
        new Date(a.startTime) > now && a.status === 'scheduled'
      );

      const stats = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
        upcomingAppointments: upcoming.length,
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: `Failed to get staff stats: ${error}` };
    }
  }

  /**
   * Update location staff count (internal helper)
   */
  private async updateLocationStaffCount(locationId: string): Promise<void> {
    try {
      const staffResponse = await staffRepository.getByLocationId(locationId);
      const count = staffResponse.data?.filter(s => s.status === 'active').length || 0;
      await locationRepository.updateStaffCount(locationId, count);
    } catch (error) {
      console.warn('Failed to update location staff count:', error);
    }
  }
}

export const staffService = new StaffService();