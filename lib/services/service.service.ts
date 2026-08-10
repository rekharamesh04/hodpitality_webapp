/**
 * Service Service
 * 
 * Business logic for service management
 */

import { getServiceRepository, getLocationRepository, getAppointmentRepository } from '@/lib/repositories';
import type { Service, ApiResponse, PaginatedResponse, BaseFilter } from '@/types/entities';

// Lazy-initialized repository accessors
const serviceRepository = getServiceRepository();
const locationRepository = getLocationRepository();
const appointmentRepository = getAppointmentRepository();

class ServiceService {
  /**
   * Get all services with pagination
   */
  async getServices(filter?: BaseFilter): Promise<ApiResponse<PaginatedResponse<Service>>> {
    return serviceRepository.getPaginated(filter);
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<ApiResponse<Service>> {
    return serviceRepository.getById(id);
  }

  /**
   * Get services by location
   */
  async getServicesByLocation(locationId: string): Promise<ApiResponse<Service[]>> {
    return serviceRepository.getByLocationId(locationId);
  }

  /**
   * Create new service
   */
  async createService(data: {
    locationId: string;
    name: string;
    description?: string;
    duration: number;
    roomId?: string;
    price?: number;
    category?: string;
    requirements?: string[];
  }): Promise<ApiResponse<Service>> {
    // Validate required fields
    if (!data.name.trim()) {
      return { success: false, error: 'Service name is required' };
    }

    if (!data.duration || data.duration <= 0) {
      return { success: false, error: 'Valid service duration is required' };
    }

    // Validate location exists
    const locationResponse = await locationRepository.getById(data.locationId);
    if (!locationResponse.success || !locationResponse.data) {
      return { success: false, error: 'Location not found' };
    }

    // Check for duplicate name within location
    const existingResponse = await serviceRepository.getByLocationId(data.locationId);
    if (existingResponse.success && existingResponse.data) {
      const duplicate = existingResponse.data.find(
        s => s.name.toLowerCase() === data.name.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Service name already exists in this location' };
      }
    }

    const service = {
      ...data,
      companyId: locationResponse.data.companyId,
      name: data.name.trim(),
      status: 'active' as const,
    };

    return serviceRepository.create(service);
  }

  /**
   * Update service
   */
  async updateService(id: string, data: Partial<Service>): Promise<ApiResponse<Service>> {
    // Validate fields if provided
    if (data.name !== undefined && !data.name.trim()) {
      return { success: false, error: 'Service name is required' };
    }

    if (data.duration !== undefined && data.duration <= 0) {
      return { success: false, error: 'Valid service duration is required' };
    }

    // Check for duplicate name if name is being updated
    if (data.name) {
      const currentResponse = await serviceRepository.getById(id);
      if (!currentResponse.success || !currentResponse.data) {
        return { success: false, error: 'Service not found' };
      }

      const existingResponse = await serviceRepository.getByLocationId(currentResponse.data.locationId);
      if (existingResponse.success && existingResponse.data) {
        const duplicate = existingResponse.data.find(
          s => s.id !== id && s.name.toLowerCase() === data.name!.toLowerCase()
        );
        if (duplicate) {
          return { success: false, error: 'Service name already exists in this location' };
        }
      }

      data.name = data.name.trim();
    }

    return serviceRepository.update(id, data);
  }

  /**
   * Delete service (with validation)
   */
  async deleteService(id: string): Promise<ApiResponse<void>> {
    // Check if service has future appointments
    const today = new Date().toISOString().split('T')[0];
    const futureAppointmentsResponse = await appointmentRepository.getFiltered({
      serviceId: id,
      dateFrom: today,
      status: 'scheduled',
    });

    if (futureAppointmentsResponse.success && 
        futureAppointmentsResponse.data && 
        futureAppointmentsResponse.data.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete service with future appointments. Please cancel appointments first.' 
      };
    }

    return serviceRepository.delete(id);
  }

  /**
   * Archive service
   */
  async archiveService(id: string): Promise<ApiResponse<Service>> {
    return serviceRepository.archive(id);
  }

  /**
   * Get available services for a location
   */
  async getAvailableServices(locationId: string): Promise<ApiResponse<Service[]>> {
    return serviceRepository.getAvailableByLocationId(locationId);
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string, locationId?: string): Promise<ApiResponse<Service[]>> {
    const response = await serviceRepository.getByCategory(category);
    
    if (!response.success || !response.data) {
      return response;
    }

    let services = response.data;
    
    // Filter by location if specified
    if (locationId) {
      services = services.filter(s => s.locationId === locationId);
    }

    return { success: true, data: services };
  }

  /**
   * Get services by duration range
   */
  async getServicesByDuration(
    minDuration: number, 
    maxDuration: number, 
    locationId?: string
  ): Promise<ApiResponse<Service[]>> {
    const response = await serviceRepository.getByDurationRange(minDuration, maxDuration);
    
    if (!response.success || !response.data) {
      return response;
    }

    let services = response.data;
    
    // Filter by location if specified
    if (locationId) {
      services = services.filter(s => s.locationId === locationId);
    }

    return { success: true, data: services };
  }

  /**
   * Get service popularity (based on appointments)
   */
  async getServicePopularity(serviceId: string, startDate: string, endDate: string): Promise<ApiResponse<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageRating?: number;
    popularityScore: number;
  }>> {
    try {
      const appointmentsResponse = await appointmentRepository.getFiltered({
        serviceId,
        dateFrom: startDate,
        dateTo: endDate,
      });

      const appointments = appointmentsResponse.data || [];

      const completed = appointments.filter(a => a.status === 'completed').length;
      const cancelled = appointments.filter(a => a.status === 'cancelled').length;
      const total = appointments.length;

      // Calculate popularity score (completed / total * 100)
      const popularityScore = total > 0 ? (completed / total) * 100 : 0;

      return {
        success: true,
        data: {
          totalAppointments: total,
          completedAppointments: completed,
          cancelledAppointments: cancelled,
          popularityScore: Math.round(popularityScore * 100) / 100,
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to get service popularity: ${error}` };
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStats(locationId?: string): Promise<ApiResponse<{
    totalServices: number;
    activeServices: number;
    averageDuration: number;
    categories: { category: string; count: number }[];
  }>> {
    try {
      let servicesResponse;
      
      if (locationId) {
        servicesResponse = await serviceRepository.getByLocationId(locationId);
      } else {
        servicesResponse = await serviceRepository.getAll({ status: 'active' });
      }

      const services = servicesResponse.data || [];
      const activeServices = services.filter(s => s.status === 'active');

      // Calculate average duration
      const totalDuration = activeServices.reduce((sum, s) => sum + s.duration, 0);
      const averageDuration = activeServices.length > 0 ? totalDuration / activeServices.length : 0;

      // Group by category
      const categoryMap = new Map<string, number>();
      activeServices.forEach(service => {
        const category = service.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      }));

      return {
        success: true,
        data: {
          totalServices: services.length,
          activeServices: activeServices.length,
          averageDuration: Math.round(averageDuration),
          categories,
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to get service stats: ${error}` };
    }
  }
}

export const serviceService = new ServiceService();