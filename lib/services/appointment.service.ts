/**
 * Appointment Service
 * 
 * Business logic for appointment management including booking, status transitions, and availability
 */

import { 
  getAppointmentRepository,
  getCustomerRepository,
  getStaffRepository,
  getServiceRepository,
  getRoomRepository,
  getLocationRepository
} from '@/lib/repositories';
import { customerService } from './customer.service';
import type { 
  Appointment,
  AppointmentWithRelations,
  BookingRequest,
  BookingValidation,
  AvailableSlot,
  AppointmentStatus,
  AppointmentFilter,
  ApiResponse,
  PaginatedResponse
} from '@/types/entities';
import { VALID_STATUS_TRANSITIONS, isValidStatusTransition } from '@/types/entities';

// Lazy-initialized repository accessors
const appointmentRepository = getAppointmentRepository();
const customerRepository = getCustomerRepository();
const staffRepository = getStaffRepository();
const serviceRepository = getServiceRepository();
const roomRepository = getRoomRepository();
const locationRepository = getLocationRepository();

class AppointmentService {
  /**
   * Get appointments with pagination
   */
  async getAppointments(filter?: AppointmentFilter): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return appointmentRepository.getPaginated(filter);
  }

  /**
   * Get appointments with filtering
   */
  async getFilteredAppointments(filter: AppointmentFilter): Promise<ApiResponse<Appointment[]>> {
    return appointmentRepository.getFiltered(filter);
  }

  /**
   * Get appointment by ID with related data
   */
  async getAppointmentById(id: string): Promise<ApiResponse<AppointmentWithRelations>> {
    const appointmentResponse = await appointmentRepository.getById(id);
    
    if (!appointmentResponse.success || !appointmentResponse.data) {
      return { success: false, error: appointmentResponse.error };
    }

    return this.populateAppointmentRelations(appointmentResponse.data);
  }

  /**
   * Get today's appointments by location
   */
  async getTodaysAppointments(locationId: string): Promise<ApiResponse<Appointment[]>> {
    return appointmentRepository.getTodaysByLocation(locationId);
  }

  /**
   * Get appointments by date range
   */
  async getAppointmentsByDateRange(startDate: string, endDate: string, locationId?: string): Promise<ApiResponse<Appointment[]>> {
    const response = await appointmentRepository.getByDateRange(startDate, endDate);
    
    if (!response.success || !response.data) {
      return response;
    }

    let appointments = response.data;

    // Filter by location if specified
    if (locationId) {
      appointments = appointments.filter(a => a.locationId === locationId);
    }

    return { success: true, data: appointments };
  }

  /**
   * Create booking with validation
   */
  async createBooking(booking: BookingRequest): Promise<ApiResponse<Appointment>> {
    // Validate booking request
    const validationResponse = await this.validateBooking(booking);
    if (!validationResponse.success || !validationResponse.data?.valid) {
      return { 
        success: false, 
        error: validationResponse.data?.errors.join(', ') || 'Booking validation failed' 
      };
    }

    // Get service details for duration
    const serviceResponse = await serviceRepository.getById(booking.serviceId);
    if (!serviceResponse.success || !serviceResponse.data) {
      return { success: false, error: 'Service not found' };
    }

    const service = serviceResponse.data;
    const startTime = new Date(`${booking.date}T${booking.startTime}`);
    const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

    // Get customer for company ID
    const customerResponse = await customerRepository.getById(booking.customerId);
    if (!customerResponse.success || !customerResponse.data) {
      return { success: false, error: 'Customer not found' };
    }

    const appointment = {
      locationId: customerResponse.data.locationId,
      companyId: customerResponse.data.companyId,
      customerId: booking.customerId,
      staffId: booking.staffId,
      serviceId: booking.serviceId,
      roomId: booking.roomId,
      date: booking.date,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: service.duration,
      status: 'scheduled' as AppointmentStatus,
      notes: booking.notes,
    };

    return appointmentRepository.create(appointment);
  }

  /**
   * Validate booking request
   */
  async validateBooking(booking: BookingRequest, excludeAppointmentId?: string): Promise<ApiResponse<BookingValidation>> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if customer exists
      const customerResponse = await customerRepository.getById(booking.customerId);
      if (!customerResponse.success || !customerResponse.data) {
        errors.push('Customer not found');
      }

      // Check if staff exists
      const staffResponse = await staffRepository.getById(booking.staffId);
      if (!staffResponse.success || !staffResponse.data) {
        errors.push('Staff member not found');
      }

      // Check if service exists
      const serviceResponse = await serviceRepository.getById(booking.serviceId);
      if (!serviceResponse.success || !serviceResponse.data) {
        errors.push('Service not found');
      }

      // Check if room exists
      const roomResponse = await roomRepository.getById(booking.roomId);
      if (!roomResponse.success || !roomResponse.data) {
        errors.push('Room not found');
      }

      // If basic entities don't exist, return early
      if (errors.length > 0) {
        return {
          success: true,
          data: { valid: false, errors, warnings },
        };
      }

      const service = serviceResponse.data!;
      const startTime = new Date(`${booking.date}T${booking.startTime}`);
      const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

      // Check for scheduling conflicts
      const conflictsResponse = await appointmentRepository.checkConflicts(
        booking.staffId,
        booking.roomId,
        startTime.toISOString(),
        endTime.toISOString(),
        excludeAppointmentId
      );

      if (conflictsResponse.success && conflictsResponse.data && conflictsResponse.data.length > 0) {
        errors.push('Time slot conflicts with existing appointment');
      }

      // Check if booking is in the past
      const now = new Date();
      if (startTime <= now) {
        errors.push('Cannot book appointments in the past');
      }

      // Check if booking is too far in the future (optional business rule)
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      if (startTime > sixMonthsFromNow) {
        warnings.push('Booking is more than 6 months in the future');
      }

      return {
        success: true,
        data: {
          valid: errors.length === 0,
          errors,
          warnings,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error}`,
      };
    }
  }

  /**
   * Update appointment
   */
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    // If updating scheduling details, validate
    if (data.staffId || data.roomId || data.startTime || data.endTime) {
      const currentResponse = await appointmentRepository.getById(id);
      if (!currentResponse.success || !currentResponse.data) {
        return { success: false, error: 'Appointment not found' };
      }

      const current = currentResponse.data;
      
      // Create booking request from current + new data
      if (data.startTime) {
        const booking: BookingRequest = {
          customerId: current.customerId,
          serviceId: current.serviceId,
          staffId: data.staffId || current.staffId,
          roomId: data.roomId || current.roomId,
          date: data.startTime.split('T')[0],
          startTime: data.startTime.split('T')[1].substring(0, 5),
        };

        const validationResponse = await this.validateBooking(booking, id);
        if (!validationResponse.success || !validationResponse.data?.valid) {
          return { 
            success: false, 
            error: validationResponse.data?.errors.join(', ') || 'Update validation failed' 
          };
        }
      }
    }

    return appointmentRepository.update(id, data);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    id: string, 
    reason: string, 
    notes?: string, 
    cancelledBy?: string
  ): Promise<ApiResponse<Appointment>> {
    const currentResponse = await appointmentRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Appointment not found' };
    }

    const current = currentResponse.data;

    // Validate status transition
    if (!isValidStatusTransition(current.status, 'cancelled')) {
      return { 
        success: false, 
        error: `Cannot cancel appointment with status: ${current.status}` 
      };
    }

    return appointmentRepository.update(id, {
      status: 'cancelled',
      cancellationReason: reason as any,
      cancellationNotes: notes,
      cancelledAt: new Date().toISOString(),
      cancelledBy,
    });
  }

  /**
   * Check in appointment
   */
  async checkInAppointment(id: string): Promise<ApiResponse<Appointment>> {
    const currentResponse = await appointmentRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Appointment not found' };
    }

    const current = currentResponse.data;

    // Validate status transition
    if (!isValidStatusTransition(current.status, 'checked-in')) {
      return { 
        success: false, 
        error: `Cannot check in appointment with status: ${current.status}` 
      };
    }

    return appointmentRepository.update(id, {
      status: 'checked-in',
      checkedInAt: new Date().toISOString(),
    });
  }

  /**
   * Complete appointment
   */
  async completeAppointment(id: string, notes?: string): Promise<ApiResponse<Appointment>> {
    const currentResponse = await appointmentRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Appointment not found' };
    }

    const current = currentResponse.data;

    // Validate status transition
    if (!isValidStatusTransition(current.status, 'completed')) {
      return { 
        success: false, 
        error: `Cannot complete appointment with status: ${current.status}` 
      };
    }

    const result = await appointmentRepository.update(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      internalNotes: notes ? `${current.internalNotes || ''}\n${notes}`.trim() : current.internalNotes,
    });

    // Record customer visit
    if (result.success && result.data) {
      await customerService.recordVisit(current.customerId);
    }

    return result;
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(id: string, notes?: string): Promise<ApiResponse<Appointment>> {
    const currentResponse = await appointmentRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Appointment not found' };
    }

    const current = currentResponse.data;

    // Validate status transition
    if (!isValidStatusTransition(current.status, 'no-show')) {
      return { 
        success: false, 
        error: `Cannot mark as no-show appointment with status: ${current.status}` 
      };
    }

    return appointmentRepository.update(id, {
      status: 'no-show',
      internalNotes: notes ? `${current.internalNotes || ''}\nNo-show: ${notes}`.trim() : current.internalNotes,
    });
  }

  /**
   * Restore cancelled or no-show appointment
   */
  async restoreAppointment(id: string): Promise<ApiResponse<Appointment>> {
    const currentResponse = await appointmentRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Appointment not found' };
    }

    const current = currentResponse.data;

    // Validate status transition
    if (!isValidStatusTransition(current.status, 'scheduled')) {
      return { 
        success: false, 
        error: `Cannot restore appointment with status: ${current.status}` 
      };
    }

    // Check if appointment time is still available
    const conflictsResponse = await appointmentRepository.checkConflicts(
      current.staffId,
      current.roomId,
      current.startTime,
      current.endTime,
      id
    );

    if (conflictsResponse.success && conflictsResponse.data && conflictsResponse.data.length > 0) {
      return { success: false, error: 'Cannot restore - time slot is no longer available' };
    }

    return appointmentRepository.update(id, {
      status: 'scheduled',
      cancellationReason: undefined,
      cancellationNotes: undefined,
      cancelledAt: undefined,
      cancelledBy: undefined,
    });
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    const currentResponse = await appointmentRepository.getById(id);
    if (!currentResponse.success || !currentResponse.data) {
      return { success: false, error: 'Appointment not found' };
    }

    const current = currentResponse.data;

    // Only allow deletion of cancelled or no-show appointments
    if (!['cancelled', 'no-show'].includes(current.status)) {
      return { 
        success: false, 
        error: 'Can only delete cancelled or no-show appointments' 
      };
    }

    return appointmentRepository.delete(id);
  }

  /**
   * Get available time slots
   */
  async getAvailableSlots(
    locationId: string,
    serviceId: string,
    staffId: string,
    date: string
  ): Promise<ApiResponse<AvailableSlot[]>> {
    try {
      // Get service details
      const serviceResponse = await serviceRepository.getById(serviceId);
      if (!serviceResponse.success || !serviceResponse.data) {
        return { success: false, error: 'Service not found' };
      }

      const service = serviceResponse.data;

      // Get staff schedule (simplified - assuming 9 AM to 6 PM)
      const workStart = 9 * 60; // 9 AM in minutes
      const workEnd = 18 * 60;  // 6 PM in minutes
      const slotDuration = service.duration;

      // Get existing appointments for the day
      const existingResponse = await appointmentRepository.getByDate(date);
      const existingAppointments = existingResponse.data?.filter(a => 
        a.staffId === staffId && ['scheduled', 'checked-in'].includes(a.status)
      ) || [];

      const slots: AvailableSlot[] = [];

      // Generate potential slots
      for (let minutes = workStart; minutes + slotDuration <= workEnd; minutes += 30) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const startTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        
        const slotStart = new Date(`${date}T${startTime}`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          const aptStart = new Date(apt.startTime).getTime();
          const aptEnd = new Date(apt.endTime).getTime();
          return slotStart.getTime() < aptEnd && slotEnd.getTime() > aptStart;
        });

        slots.push({
          date,
          startTime,
          endTime: slotEnd.toTimeString().substring(0, 5),
          staffId,
          roomId: service.roomId || '',
          available: !hasConflict,
          reason: hasConflict ? 'Slot unavailable' : undefined,
        });
      }

      return { success: true, data: slots };
    } catch (error) {
      return { success: false, error: `Failed to get available slots: ${error}` };
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(locationId?: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<{
    total: number;
    scheduled: number;
    checkedIn: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }>> {
    try {
      const filter: AppointmentFilter = {};
      
      if (locationId) filter.locationId = locationId;
      if (dateFrom) filter.dateFrom = dateFrom;
      if (dateTo) filter.dateTo = dateTo;

      const response = await appointmentRepository.getFiltered(filter);
      const appointments = response.data || [];

      const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        checkedIn: appointments.filter(a => a.status === 'checked-in').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        noShow: appointments.filter(a => a.status === 'no-show').length,
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: `Failed to get appointment stats: ${error}` };
    }
  }

  /**
   * Populate appointment with related entity data
   */
  private async populateAppointmentRelations(appointment: Appointment): Promise<ApiResponse<AppointmentWithRelations>> {
    try {
      const [customerRes, staffRes, serviceRes, roomRes, locationRes] = await Promise.all([
        customerRepository.getById(appointment.customerId),
        staffRepository.getById(appointment.staffId),
        serviceRepository.getById(appointment.serviceId),
        roomRepository.getById(appointment.roomId),
        locationRepository.getById(appointment.locationId),
      ]);

      if (!customerRes.success || !staffRes.success || !serviceRes.success || !roomRes.success || !locationRes.success) {
        return { success: false, error: 'Failed to load related data' };
      }

      const populated: AppointmentWithRelations = {
        ...appointment,
        customer: customerRes.data!,
        staff: staffRes.data!,
        service: serviceRes.data!,
        room: roomRes.data!,
        location: locationRes.data!,
      };

      return { success: true, data: populated };
    } catch (error) {
      return { success: false, error: `Failed to populate relations: ${error}` };
    }
  }
}

export const appointmentService = new AppointmentService();