/**
 * Dashboard Service
 * 
 * Business logic for dashboard metrics and analytics
 */

import { 
  getAppointmentRepository,
  getCustomerRepository,
  getStaffRepository,
  getLocationRepository,
  getCompanyRepository
} from '@/lib/repositories';
import type { 
  DashboardStats,
  ActivityFeedItem,
  DataScope,
  ApiResponse
} from '@/types/entities';

// Lazy-initialized repository accessors
const appointmentRepository = getAppointmentRepository();
const customerRepository = getCustomerRepository();
const staffRepository = getStaffRepository();
const locationRepository = getLocationRepository();
const companyRepository = getCompanyRepository();

class DashboardService {
  /**
   * Get dashboard statistics for a given scope
   */
  async getDashboardStats(scope: DataScope): Promise<ApiResponse<DashboardStats>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisWeekStart = this.getWeekStart(new Date()).toISOString().split('T')[0];
      const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Get today's appointments
      const todaysAppointmentsResponse = await appointmentRepository.getFiltered({
        date: today,
        ...(scope.locationIds?.length ? { locationId: scope.locationIds[0] } : {}),
      });

      const todaysAppointments = todaysAppointmentsResponse.data || [];

      // Get this week's appointments
      const thisWeekResponse = await appointmentRepository.getByDateRange(thisWeekStart, today);
      let thisWeekAppointments = thisWeekResponse.data || [];

      // Get this month's appointments
      const thisMonthResponse = await appointmentRepository.getByDateRange(thisMonthStart, today);
      let thisMonthAppointments = thisMonthResponse.data || [];

      // Apply scope filtering
      if (scope.locationIds?.length) {
        thisWeekAppointments = thisWeekAppointments.filter(a => scope.locationIds!.includes(a.locationId));
        thisMonthAppointments = thisMonthAppointments.filter(a => scope.locationIds!.includes(a.locationId));
      } else if (scope.companyIds?.length) {
        thisWeekAppointments = thisWeekAppointments.filter(a => scope.companyIds!.includes(a.companyId));
        thisMonthAppointments = thisMonthAppointments.filter(a => scope.companyIds!.includes(a.companyId));
      }

      // Count customers
      let totalCustomers = 0;
      if (scope.locationIds?.length) {
        for (const locationId of scope.locationIds) {
          const customersResponse = await customerRepository.getByLocationId(locationId);
          totalCustomers += customersResponse.data?.filter(c => c.status === 'active').length || 0;
        }
      } else if (scope.companyIds?.length) {
        for (const companyId of scope.companyIds) {
          const customersResponse = await customerRepository.getByCompanyId(companyId);
          totalCustomers += customersResponse.data?.filter(c => c.status === 'active').length || 0;
        }
      } else {
        const allCustomersResponse = await customerRepository.getAll({ status: 'active' });
        totalCustomers = allCustomersResponse.data?.length || 0;
      }

      // Count staff
      let totalStaff = 0;
      if (scope.locationIds?.length) {
        for (const locationId of scope.locationIds) {
          const staffResponse = await staffRepository.getByLocationId(locationId);
          totalStaff += staffResponse.data?.filter(s => s.status === 'active').length || 0;
        }
      } else if (scope.companyIds?.length) {
        for (const companyId of scope.companyIds) {
          const staffResponse = await staffRepository.getByCompanyId(companyId);
          totalStaff += staffResponse.data?.filter(s => s.status === 'active').length || 0;
        }
      } else {
        const allStaffResponse = await staffRepository.getAll({ status: 'active' });
        totalStaff = allStaffResponse.data?.length || 0;
      }

      // Count locations and companies based on scope
      let totalLocations = 0;
      let totalCompanies = 0;

      if (scope.locationIds?.length) {
        totalLocations = scope.locationIds.length;
        // Get unique company IDs for these locations
        const locations = await Promise.all(
          scope.locationIds.map(id => locationRepository.getById(id))
        );
        const companyIds = new Set(
          locations
            .filter(l => l.success && l.data)
            .map(l => l.data!.companyId)
        );
        totalCompanies = companyIds.size;
      } else if (scope.companyIds?.length) {
        totalCompanies = scope.companyIds.length;
        for (const companyId of scope.companyIds) {
          const locationsResponse = await locationRepository.getByCompanyId(companyId);
          totalLocations += locationsResponse.data?.filter(l => l.status === 'active').length || 0;
        }
      } else {
        const allCompaniesResponse = await companyRepository.getAll({ status: 'active' });
        const allLocationsResponse = await locationRepository.getAll({ status: 'active' });
        totalCompanies = allCompaniesResponse.data?.length || 0;
        totalLocations = allLocationsResponse.data?.length || 0;
      }

      const stats: DashboardStats = {
        // Today's metrics
        todayAppointments: todaysAppointments.length,
        todayCheckedIn: todaysAppointments.filter(a => a.status === 'checked-in').length,
        todayCompleted: todaysAppointments.filter(a => a.status === 'completed').length,
        todayScheduled: todaysAppointments.filter(a => a.status === 'scheduled').length,
        todayNoShows: todaysAppointments.filter(a => a.status === 'no-show').length,
        todayCancelled: todaysAppointments.filter(a => a.status === 'cancelled').length,

        // Overall metrics
        totalCustomers,
        totalStaff,
        totalLocations,
        totalCompanies,

        // Period metrics
        thisWeekAppointments: thisWeekAppointments.length,
        thisMonthAppointments: thisMonthAppointments.length,
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: `Failed to get dashboard stats: ${error}` };
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(scope: DataScope, limit = 20): Promise<ApiResponse<ActivityFeedItem[]>> {
    try {
      const activities: ActivityFeedItem[] = [];

      // Get recent appointments (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const recentAppointmentsResponse = await appointmentRepository.getByDateRange(startDate, today);
      let recentAppointments = recentAppointmentsResponse.data || [];

      // Apply scope filtering
      if (scope.locationIds?.length) {
        recentAppointments = recentAppointments.filter(a => scope.locationIds!.includes(a.locationId));
      } else if (scope.companyIds?.length) {
        recentAppointments = recentAppointments.filter(a => scope.companyIds!.includes(a.companyId));
      }

      // Convert appointments to activity items
      for (const appointment of recentAppointments.slice(-10)) { // Last 10 appointments
        let type: ActivityFeedItem['type'] = 'appointment';
        let title = '';
        let description = '';

        switch (appointment.status) {
          case 'scheduled':
            title = 'Appointment Scheduled';
            description = `New appointment scheduled for ${appointment.date}`;
            break;
          case 'checked-in':
            type = 'check-in';
            title = 'Customer Checked In';
            description = `Customer checked in for appointment`;
            break;
          case 'completed':
            title = 'Appointment Completed';
            description = `Appointment completed successfully`;
            break;
          case 'cancelled':
            type = 'cancellation';
            title = 'Appointment Cancelled';
            description = `Appointment cancelled: ${appointment.cancellationReason || 'No reason provided'}`;
            break;
          case 'no-show':
            title = 'Customer No-Show';
            description = `Customer did not show up for appointment`;
            break;
        }

        activities.push({
          id: appointment.id,
          type,
          title,
          description,
          timestamp: appointment.updatedAt,
          metadata: {
            appointmentId: appointment.id,
            customerId: appointment.customerId,
            status: appointment.status,
          },
        });
      }

      // Get recent customers (last 10)
      const recentCustomersResponse = await customerRepository.getAll({ 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });
      
      let recentCustomers = recentCustomersResponse.data?.slice(0, 5) || [];
      
      // Apply scope filtering
      if (scope.locationIds?.length) {
        recentCustomers = recentCustomers.filter(c => scope.locationIds!.includes(c.locationId));
      } else if (scope.companyIds?.length) {
        recentCustomers = recentCustomers.filter(c => scope.companyIds!.includes(c.companyId));
      }

      // Convert customers to activity items
      for (const customer of recentCustomers) {
        activities.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          title: 'New Customer Registered',
          description: `${customer.name} joined as a ${customer.membershipTier} member`,
          timestamp: customer.createdAt,
          metadata: {
            customerId: customer.id,
            membershipTier: customer.membershipTier,
          },
        });
      }

      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return { success: true, data: activities.slice(0, limit) };
    } catch (error) {
      return { success: false, error: `Failed to get activity feed: ${error}` };
    }
  }

  /**
   * Get upcoming appointments for today
   */
  async getUpcomingAppointments(scope: DataScope, limit = 10): Promise<ApiResponse<any[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      const todaysResponse = await appointmentRepository.getFiltered({
        date: today,
        status: 'scheduled',
      });

      let appointments = todaysResponse.data || [];

      // Apply scope filtering
      if (scope.locationIds?.length) {
        appointments = appointments.filter(a => scope.locationIds!.includes(a.locationId));
      } else if (scope.companyIds?.length) {
        appointments = appointments.filter(a => scope.companyIds!.includes(a.companyId));
      }

      // Filter to upcoming only and sort
      const upcoming = appointments
        .filter(a => new Date(a.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, limit);

      return { success: true, data: upcoming };
    } catch (error) {
      return { success: false, error: `Failed to get upcoming appointments: ${error}` };
    }
  }

  /**
   * Get occupancy data for locations
   */
  async getLocationOccupancy(scope: DataScope): Promise<ApiResponse<{
    locationId: string;
    locationName: string;
    currentOccupancy: number;
    capacity: number;
    utilizationRate: number;
  }[]>> {
    try {
      let locationIds: string[] = [];

      if (scope.locationIds?.length) {
        locationIds = scope.locationIds;
      } else if (scope.companyIds?.length) {
        for (const companyId of scope.companyIds) {
          const locationsResponse = await locationRepository.getByCompanyId(companyId);
          locationIds.push(...(locationsResponse.data?.map(l => l.id) || []));
        }
      } else {
        const allLocationsResponse = await locationRepository.getAll({ status: 'active' });
        locationIds = allLocationsResponse.data?.map(l => l.id) || [];
      }

      const occupancyData: Array<{ locationId: string; locationName: string; currentOccupancy: number; capacity: number; utilizationRate: number }> = [];
      const now = new Date();

      for (const locationId of locationIds.slice(0, 10)) { // Limit for performance
        const locationResponse = await locationRepository.getById(locationId);
        if (!locationResponse.success || !locationResponse.data) continue;

        const location = locationResponse.data;

        // Get current appointments (checked-in)
        const currentAppointmentsResponse = await appointmentRepository.getFiltered({
          locationId,
          status: 'checked-in',
        });

        const currentOccupancy = currentAppointmentsResponse.data?.length || 0;
        
        // Simplified capacity calculation (would be based on rooms in real implementation)
        const capacity = 10; // Default capacity
        const utilizationRate = capacity > 0 ? (currentOccupancy / capacity) * 100 : 0;

        occupancyData.push({
          locationId,
          locationName: location.name,
          currentOccupancy,
          capacity,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
        });
      }

      return { success: true, data: occupancyData };
    } catch (error) {
      return { success: false, error: `Failed to get location occupancy: ${error}` };
    }
  }

  /**
   * Helper to get start of current week
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }
}

export const dashboardService = new DashboardService();