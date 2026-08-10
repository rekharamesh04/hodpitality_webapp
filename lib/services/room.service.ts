/**
 * Room Service
 * 
 * Business logic for room management
 */

import { getRoomRepository, getLocationRepository, getServiceRepository, getAppointmentRepository } from '@/lib/repositories';
import type { Room, ApiResponse, PaginatedResponse, BaseFilter } from '@/types/entities';

// Lazy-initialized repository accessors
const roomRepository = getRoomRepository();
const locationRepository = getLocationRepository();
const serviceRepository = getServiceRepository();
const appointmentRepository = getAppointmentRepository();

class RoomService {
  /**
   * Get all rooms with pagination
   */
  async getRooms(filter?: BaseFilter): Promise<ApiResponse<PaginatedResponse<Room>>> {
    return roomRepository.getPaginated(filter);
  }

  /**
   * Get room by ID
   */
  async getRoomById(id: string): Promise<ApiResponse<Room>> {
    return roomRepository.getById(id);
  }

  /**
   * Get rooms by location
   */
  async getRoomsByLocation(locationId: string): Promise<ApiResponse<Room[]>> {
    return roomRepository.getByLocationId(locationId);
  }

  /**
   * Create new room
   */
  async createRoom(data: {
    locationId: string;
    name: string;
    type: string;
    capacity?: number;
    floor?: string;
    description?: string;
    amenities?: string[];
  }): Promise<ApiResponse<Room>> {
    // Validate required fields
    if (!data.name.trim()) {
      return { success: false, error: 'Room name is required' };
    }

    // Validate location exists
    const locationResponse = await locationRepository.getById(data.locationId);
    if (!locationResponse.success || !locationResponse.data) {
      return { success: false, error: 'Location not found' };
    }

    // Check for duplicate name within location
    const existingResponse = await roomRepository.getByLocationId(data.locationId);
    if (existingResponse.success && existingResponse.data) {
      const duplicate = existingResponse.data.find(
        r => r.name.toLowerCase() === data.name.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Room name already exists in this location' };
      }
    }

    const room = {
      ...data,
      companyId: locationResponse.data.companyId,
      name: data.name.trim(),
      type: data.type as any,
      status: 'active' as const,
    };

    return roomRepository.create(room);
  }

  /**
   * Update room
   */
  async updateRoom(id: string, data: Partial<Room>): Promise<ApiResponse<Room>> {
    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return { success: false, error: 'Room name is required' };
      }

      // Get current room to check location
      const currentResponse = await roomRepository.getById(id);
      if (!currentResponse.success || !currentResponse.data) {
        return { success: false, error: 'Room not found' };
      }

      // Check for duplicate name within location (excluding current room)
      const existingResponse = await roomRepository.getByLocationId(currentResponse.data.locationId);
      if (existingResponse.success && existingResponse.data) {
        const duplicate = existingResponse.data.find(
          r => r.id !== id && r.name.toLowerCase() === data.name!.toLowerCase()
        );
        if (duplicate) {
          return { success: false, error: 'Room name already exists in this location' };
        }
      }

      data.name = data.name.trim();
    }

    return roomRepository.update(id, data);
  }

  /**
   * Delete room (with validation)
   */
  async deleteRoom(id: string): Promise<ApiResponse<void>> {
    // Check if room is assigned to any services
    const servicesResponse = await serviceRepository.getByRoomId(id);
    if (servicesResponse.success && servicesResponse.data && servicesResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete room that is assigned to services. Please update services first.' 
      };
    }

    // Check if room has future appointments
    const today = new Date().toISOString().split('T')[0];
    const futureAppointmentsResponse = await appointmentRepository.getFiltered({
      roomId: id,
      dateFrom: today,
      status: 'scheduled',
    });

    if (futureAppointmentsResponse.success && 
        futureAppointmentsResponse.data && 
        futureAppointmentsResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete room with future appointments. Please reassign appointments first.' 
      };
    }

    return roomRepository.delete(id);
  }

  /**
   * Archive room
   */
  async archiveRoom(id: string): Promise<ApiResponse<Room>> {
    return roomRepository.archive(id);
  }

  /**
   * Get available rooms for a location
   */
  async getAvailableRooms(locationId: string): Promise<ApiResponse<Room[]>> {
    return roomRepository.getAvailableByLocationId(locationId);
  }

  /**
   * Get rooms by type
   */
  async getRoomsByType(type: string, locationId?: string): Promise<ApiResponse<Room[]>> {
    const response = await roomRepository.getByType(type);
    
    if (!response.success || !response.data) {
      return response;
    }

    let rooms = response.data;
    
    // Filter by location if specified
    if (locationId) {
      rooms = rooms.filter(r => r.locationId === locationId);
    }

    return { success: true, data: rooms };
  }

  /**
   * Get room utilization
   */
  async getRoomUtilization(roomId: string, startDate: string, endDate: string): Promise<ApiResponse<{
    totalSlots: number;
    bookedSlots: number;
    utilizationRate: number;
    appointments: any[];
  }>> {
    try {
      // Get appointments for the room in the date range
      const appointmentsResponse = await appointmentRepository.getFiltered({
        roomId,
        dateFrom: startDate,
        dateTo: endDate,
        status: 'scheduled',
      });

      const appointments = appointmentsResponse.data || [];

      // Calculate total available slots (simplified: 9 AM to 6 PM, 30-min slots)
      const daysInRange = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const slotsPerDay = 18; // 9 hours * 2 (30-min slots)
      const totalSlots = daysInRange * slotsPerDay;
      const bookedSlots = appointments.length;
      const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      return {
        success: true,
        data: {
          totalSlots,
          bookedSlots,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
          appointments,
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to get room utilization: ${error}` };
    }
  }
}

export const roomService = new RoomService();