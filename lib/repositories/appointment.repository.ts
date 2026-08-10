/**
 * Appointment Repository
 */

import { STORES } from '@/lib/storage/indexeddb';
import { BaseRepository } from './base.repository';
import type { Appointment, AppointmentFilter, ApiResponse } from '@/types/entities';

class AppointmentRepository extends BaseRepository<Appointment> {
  constructor() {
    super(STORES.APPOINTMENTS);
  }

  protected applySearchFilter(items: Appointment[], search: string): Appointment[] {
    const searchLower = search.toLowerCase();
    return items.filter(
      item =>
        item.notes?.toLowerCase().includes(searchLower) ||
        item.customerNotes?.toLowerCase().includes(searchLower) ||
        item.internalNotes?.toLowerCase().includes(searchLower) ||
        item.cancellationNotes?.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get appointments by location ID
   */
  async getByLocationId(locationId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('locationId', locationId);
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by location: ${error}` };
    }
  }

  /**
   * Get appointments by company ID
   */
  async getByCompanyId(companyId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('companyId', companyId);
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by company: ${error}` };
    }
  }

  /**
   * Get appointments by customer ID
   */
  async getByCustomerId(customerId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('customerId', customerId);
      // Sort by date descending (most recent first)
      appointments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by customer: ${error}` };
    }
  }

  /**
   * Get appointments by staff ID
   */
  async getByStaffId(staffId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('staffId', staffId);
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by staff: ${error}` };
    }
  }

  /**
   * Get appointments by service ID
   */
  async getByServiceId(serviceId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('serviceId', serviceId);
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by service: ${error}` };
    }
  }

  /**
   * Get appointments by room ID
   */
  async getByRoomId(roomId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('roomId', roomId);
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by room: ${error}` };
    }
  }

  /**
   * Get appointments by date
   */
  async getByDate(date: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('date', date);
      // Sort by start time
      appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by date: ${error}` };
    }
  }

  /**
   * Get appointments by status
   */
  async getByStatus(status: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const appointments = await this.getByIndex('status', status);
      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by status: ${error}` };
    }
  }

  /**
   * Get appointments with advanced filtering
   */
  async getFiltered(filter: AppointmentFilter): Promise<ApiResponse<Appointment[]>> {
    try {
      const allResponse = await this.getAll(filter);
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      let appointments = allResponse.data;

      // Apply location filter
      if (filter.locationId) {
        appointments = appointments.filter(a => a.locationId === filter.locationId);
      }

      // Apply customer filter
      if (filter.customerId) {
        appointments = appointments.filter(a => a.customerId === filter.customerId);
      }

      // Apply staff filter
      if (filter.staffId) {
        appointments = appointments.filter(a => a.staffId === filter.staffId);
      }

      // Apply service filter
      if (filter.serviceId) {
        appointments = appointments.filter(a => a.serviceId === filter.serviceId);
      }

      // Apply room filter
      if (filter.roomId) {
        appointments = appointments.filter(a => a.roomId === filter.roomId);
      }

      // Apply status filter
      if (filter.status) {
        appointments = appointments.filter(a => a.status === filter.status);
      }

      // Apply date filter
      if (filter.date) {
        appointments = appointments.filter(a => a.date === filter.date);
      }

      // Apply date range filters
      if (filter.dateFrom) {
        appointments = appointments.filter(a => a.date >= filter.dateFrom!);
      }

      if (filter.dateTo) {
        appointments = appointments.filter(a => a.date <= filter.dateTo!);
      }

      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to filter appointments: ${error}` };
    }
  }

  /**
   * Get appointments by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const appointments = allResponse.data.filter(a => 
        a.date >= startDate && a.date <= endDate
      );

      // Sort by date and time
      appointments.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare === 0) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        return dateCompare;
      });

      return { success: true, data: appointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch by date range: ${error}` };
    }
  }

  /**
   * Check for appointment conflicts
   */
  async checkConflicts(
    staffId: string,
    roomId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<ApiResponse<Appointment[]>> {
    try {
      const allResponse = await this.getAll();
      
      if (!allResponse.success || !allResponse.data) {
        return { success: false, error: allResponse.error };
      }

      const conflicts = allResponse.data.filter(appointment => {
        // Exclude the current appointment if updating
        if (excludeId && appointment.id === excludeId) {
          return false;
        }

        // Only check scheduled and checked-in appointments
        if (!['scheduled', 'checked-in'].includes(appointment.status)) {
          return false;
        }

        // Check staff or room conflict
        const staffConflict = appointment.staffId === staffId;
        const roomConflict = appointment.roomId === roomId;
        
        if (!staffConflict && !roomConflict) {
          return false;
        }

        // Check time overlap
        const appointmentStart = new Date(appointment.startTime).getTime();
        const appointmentEnd = new Date(appointment.endTime).getTime();
        const newStart = new Date(startTime).getTime();
        const newEnd = new Date(endTime).getTime();

        // Times overlap if: start time is before their end time AND end time is after their start time
        return newStart < appointmentEnd && newEnd > appointmentStart;
      });

      return { success: true, data: conflicts };
    } catch (error) {
      return { success: false, error: `Failed to check conflicts: ${error}` };
    }
  }

  /**
   * Get today's appointments by location
   */
  async getTodaysByLocation(locationId: string): Promise<ApiResponse<Appointment[]>> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const todaysResponse = await this.getByDate(today);
      
      if (!todaysResponse.success || !todaysResponse.data) {
        return { success: false, error: todaysResponse.error };
      }

      const locationAppointments = todaysResponse.data.filter(a => a.locationId === locationId);
      return { success: true, data: locationAppointments };
    } catch (error) {
      return { success: false, error: `Failed to fetch today's appointments: ${error}` };
    }
  }

  /**
   * Get upcoming appointments for a customer
   */
  async getUpcomingByCustomer(customerId: string, limit = 10): Promise<ApiResponse<Appointment[]>> {
    try {
      const customerResponse = await this.getByCustomerId(customerId);
      
      if (!customerResponse.success || !customerResponse.data) {
        return { success: false, error: customerResponse.error };
      }

      const now = new Date();
      const upcoming = customerResponse.data
        .filter(a => new Date(a.startTime) > now && a.status === 'scheduled')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, limit);

      return { success: true, data: upcoming };
    } catch (error) {
      return { success: false, error: `Failed to fetch upcoming appointments: ${error}` };
    }
  }
}

export const appointmentRepository = new AppointmentRepository();