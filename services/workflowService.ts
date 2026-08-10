import type { Guest, Registration, CheckIn, Hospitality, Event } from '@/types';
import { mockApiService } from './mockApi';

export interface WorkflowResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FullRegistrationData {
  // Guest information
  guestName: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  category: 'VIP' | 'Speaker' | 'Delegate' | 'Staff' | 'Press';
  
  // Event information
  eventId: string;
  eventTitle: string;
  
  // Payment information
  paymentAmount?: number;
  
  // Additional preferences
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  notes?: string;
  
  // Hospitality requests
  hospitalityRequests?: {
    type: 'Hotel' | 'Transport' | 'Meal' | 'Airport Pickup' | 'Special Request';
    description: string;
    serviceDate: string;
    cost?: number;
  }[];
}

export interface CheckInWorkflowData {
  method: 'QR' | 'Manual' | 'Self';
  venue?: string;
  qrCode?: string;
  guestId?: string;
  printBadge?: boolean;
}

class WorkflowService {
  
  // ==================== COMPLETE REGISTRATION WORKFLOW ====================
  
  /**
   * Complete guest registration workflow:
   * 1. Create or update guest record
   * 2. Create event registration
   * 3. Process hospitality requests
   * 4. Send confirmation notifications
   */
  async completeRegistration(data: FullRegistrationData): Promise<WorkflowResponse<{
    guest: Guest;
    registration: Registration;
    hospitality: Hospitality[];
  }>> {
    try {
      // Step 1: Create or find existing guest
      const existingGuestsResponse = await mockApiService.getGuests({
        search: data.email,
        pageSize: 1
      });
      
      let guest: Guest;
      
      if (existingGuestsResponse.success && existingGuestsResponse.data!.data.length > 0) {
        // Update existing guest
        const existingGuest = existingGuestsResponse.data!.data[0];
        const updateResponse = await mockApiService.updateGuest(existingGuest.id, {
          name: data.guestName,
          phone: data.phone,
          company: data.company,
          designation: data.designation,
          category: data.category,
          notes: data.notes,
        });
        
        if (!updateResponse.success) {
          return { success: false, error: 'Failed to update guest information' };
        }
        guest = updateResponse.data!;
      } else {
        // Create new guest
        const guestResponse = await mockApiService.createGuest({
          name: data.guestName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          designation: data.designation,
          category: data.category,
          status: 'active',
          checkedIn: false,
          registrationDate: new Date().toISOString(),
          notes: data.notes,
          tags: data.dietaryRestrictions?.concat(data.accessibilityNeeds || []),
        });
        
        if (!guestResponse.success) {
          return { success: false, error: 'Failed to create guest record' };
        }
        guest = guestResponse.data!;
      }

      // Step 2: Create event registration
      const registrationResponse = await mockApiService.createRegistration({
        guestName: data.guestName,
        guestEmail: data.email,
        phone: data.phone,
        event: data.eventTitle,
        registrationDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: data.paymentAmount ? 'pending' : 'paid',
        amount: data.paymentAmount,
        category: data.category,
      });
      
      if (!registrationResponse.success) {
        return { success: false, error: 'Failed to create event registration' };
      }

      // Step 3: Process hospitality requests
      const hospitalityRecords: Hospitality[] = [];
      
      if (data.hospitalityRequests && data.hospitalityRequests.length > 0) {
        for (const request of data.hospitalityRequests) {
          const hospResponse = await mockApiService.createHospitality({
            guestId: guest.id,
            guestName: guest.name,
            type: request.type,
            description: request.description,
            status: 'pending',
            bookingDate: new Date().toISOString(),
            serviceDate: request.serviceDate,
            cost: request.cost,
          });
          
          if (hospResponse.success) {
            hospitalityRecords.push(hospResponse.data!);
          }
        }
      }

      return {
        success: true,
        data: {
          guest,
          registration: registrationResponse.data!,
          hospitality: hospitalityRecords,
        },
        message: `Registration completed successfully for ${data.guestName}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during registration'
      };
    }
  }
  // ==================== CHECK-IN WORKFLOW ====================
  
  /**
   * Complete check-in workflow:
   * 1. Verify guest registration
   * 2. Process check-in
   * 3. Print badge (optional)
   * 4. Update venue occupancy
   */
  async processCheckIn(data: CheckInWorkflowData): Promise<WorkflowResponse<{
    checkIn: CheckIn;
    guest: Guest;
    badgePrinted: boolean;
  }>> {
    try {
      let checkInResponse;
      
      // Process check-in based on method
      if (data.method === 'QR' && data.qrCode) {
        checkInResponse = await mockApiService.checkInByQr(data.qrCode, data.venue);
      } else if (data.guestId) {
        checkInResponse = await mockApiService.checkInGuest(data.guestId, data.method, data.venue);
      } else {
        return { success: false, error: 'Invalid check-in data. Provide either QR code or guest ID' };
      }
      
      if (!checkInResponse.success) {
        return { success: false, error: checkInResponse.error };
      }
      
      const checkIn = checkInResponse.data!;
      
      // Get updated guest information
      const guestResponse = await mockApiService.getGuest(checkIn.guestId);
      if (!guestResponse.success) {
        return { success: false, error: 'Failed to fetch guest details' };
      }
      
      // Print badge if requested
      let badgePrinted = false;
      if (data.printBadge) {
        const badgeResponse = await mockApiService.printBadge(checkIn.id);
        badgePrinted = badgeResponse.success;
      }
      
      return {
        success: true,
        data: {
          checkIn,
          guest: guestResponse.data!,
          badgePrinted,
        },
        message: `Check-in successful for ${checkIn.guestName}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during check-in'
      };
    }
  }
  
  // ==================== EVENT MANAGEMENT WORKFLOW ====================
  
  /**
   * Create event with venue booking:
   * 1. Validate venue availability
   * 2. Create event
   * 3. Update venue status
   */
  async createEventWithVenue(eventData: Omit<Event, 'id' | 'attendees' | 'status'>): Promise<WorkflowResponse<{
    event: Event;
    venue: any;
  }>> {
    try {
      // Validate venue exists and is available
      const venueResponse = await mockApiService.getVenue(eventData.venueId);
      if (!venueResponse.success) {
        return { success: false, error: 'Venue not found' };
      }
      
      const venue = venueResponse.data!;
      
      if (venue.status !== 'active') {
        return { success: false, error: 'Venue is not available' };
      }
      
      if (eventData.capacity > venue.capacity) {
        return {
          success: false,
          error: `Event capacity (${eventData.capacity}) exceeds venue capacity (${venue.capacity})`
        };
      }
      
      // Create event
      const eventResponse = await mockApiService.createEvent({
        ...eventData,
        attendees: 0,
        status: 'active',
      });
      
      if (!eventResponse.success) {
        return { success: false, error: 'Failed to create event' };
      }
      
      return {
        success: true,
        data: {
          event: eventResponse.data!,
          venue,
        },
        message: `Event "${eventData.title}" created successfully`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during event creation'
      };
    }
  }
  // ==================== BULK OPERATIONS WORKFLOW ====================
  
  /**
   * Bulk check-in for multiple guests
   */
  async bulkCheckIn(guestIds: string[], venue: string, method: 'QR' | 'Manual' = 'Manual'): Promise<WorkflowResponse<{
    successful: CheckIn[];
    failed: { guestId: string; error: string }[];
  }>> {
    const successful: CheckIn[] = [];
    const failed: { guestId: string; error: string }[] = [];
    
    for (const guestId of guestIds) {
      const result = await mockApiService.checkInGuest(guestId, method, venue);
      
      if (result.success) {
        successful.push(result.data!);
      } else {
        failed.push({ guestId, error: result.error || 'Unknown error' });
      }
    }
    
    return {
      success: true,
      data: { successful, failed },
      message: `Bulk check-in completed: ${successful.length} successful, ${failed.length} failed`
    };
  }
  
  /**
   * Confirm multiple registrations and process payments
   */
  async bulkConfirmRegistrations(registrationIds: string[]): Promise<WorkflowResponse<{
    confirmed: Registration[];
    failed: { registrationId: string; error: string }[];
  }>> {
    const confirmed: Registration[] = [];
    const failed: { registrationId: string; error: string }[] = [];
    
    for (const regId of registrationIds) {
      const confirmResponse = await mockApiService.confirmRegistration(regId);
      
      if (confirmResponse.success) {
        // Also mark payment as paid
        const paymentResponse = await mockApiService.updatePaymentStatus(regId, 'paid');
        
        if (paymentResponse.success) {
          confirmed.push(paymentResponse.data!);
        } else {
          failed.push({ registrationId: regId, error: 'Payment update failed' });
        }
      } else {
        failed.push({ registrationId: regId, error: confirmResponse.error || 'Unknown error' });
      }
    }
    
    return {
      success: true,
      data: { confirmed, failed },
      message: `Bulk confirmation completed: ${confirmed.length} confirmed, ${failed.length} failed`
    };
  }
  
  // ==================== HOSPITALITY PACKAGE WORKFLOW ====================
  
  /**
   * Create a complete hospitality package for a guest
   */
  async createHospitalityPackage(
    guestId: string,
    packageType: 'standard' | 'vip' | 'speaker' | 'custom',
    customServices?: {
      type: 'Hotel' | 'Transport' | 'Meal' | 'Airport Pickup' | 'Special Request';
      description: string;
      serviceDate: string;
      cost?: number;
    }[]
  ): Promise<WorkflowResponse<Hospitality[]>> {
    try {
      // Get guest information
      const guestResponse = await mockApiService.getGuest(guestId);
      if (!guestResponse.success) {
        return { success: false, error: 'Guest not found' };
      }
      
      const guest = guestResponse.data!;
      const hospitalityRecords: Hospitality[] = [];
      
      // Define standard packages
      let services: any[] = [];
      
      if (packageType === 'vip') {
        services = [
          { type: 'Hotel', description: '5-star hotel - Deluxe suite (3 nights)', cost: 1500 },
          { type: 'Airport Pickup', description: 'Luxury car with chauffeur', cost: 150 },
          { type: 'Meal', description: 'VIP dinner - All days', cost: 500 },
          { type: 'Special Request', description: 'Welcome gift and concierge service', cost: 200 },
        ];
      } else if (packageType === 'speaker') {
        services = [
          { type: 'Hotel', description: '4-star hotel - Executive room (2 nights)', cost: 800 },
          { type: 'Airport Pickup', description: 'Executive car service', cost: 100 },
          { type: 'Meal', description: 'Meals for conference days', cost: 200 },
        ];
      } else if (packageType === 'standard') {
        services = [
          { type: 'Hotel', description: 'Standard hotel - Double room (2 nights)', cost: 400 },
          { type: 'Transport', description: 'Shuttle service from hotel to venue', cost: 50 },
        ];
      } else if (packageType === 'custom' && customServices) {
        services = customServices;
      }
      
      // Create all hospitality records
      const baseDate = new Date();
      
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const serviceDate = service.serviceDate || new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString();
        
        const hospResponse = await mockApiService.createHospitality({
          guestId: guest.id,
          guestName: guest.name,
          type: service.type,
          description: service.description,
          status: 'pending',
          bookingDate: new Date().toISOString(),
          serviceDate,
          cost: service.cost,
        });
        
        if (hospResponse.success) {
          hospitalityRecords.push(hospResponse.data!);
        }
      }
      
      return {
        success: true,
        data: hospitalityRecords,
        message: `${packageType.toUpperCase()} hospitality package created for ${guest.name}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating hospitality package'
      };
    }
  }
  // ==================== GUEST JOURNEY WORKFLOW ====================
  
  /**
   * Get complete guest journey from registration to check-out
   */
  async getGuestJourney(guestId: string): Promise<WorkflowResponse<{
    guest: Guest;
    registrations: Registration[];
    checkIns: CheckIn[];
    hospitality: Hospitality[];
    events: Event[];
  }>> {
    try {
      // Get guest details
      const guestResponse = await mockApiService.getGuest(guestId);
      if (!guestResponse.success) {
        return { success: false, error: 'Guest not found' };
      }
      
      const guest = guestResponse.data!;
      
      // Get all related records
      const [registrationsRes, checkInsRes, hospitalityRes] = await Promise.all([
        mockApiService.getRegistrations({ search: guest.email }),
        mockApiService.getCheckIns({ search: guest.email }),
        mockApiService.getGuestHospitality(guestId),
      ]);
      
      const registrations = registrationsRes.success ? registrationsRes.data!.data : [];
      const checkIns = checkInsRes.success ? checkInsRes.data!.data : [];
      const hospitality = hospitalityRes.success ? hospitalityRes.data! : [];
      
      // Get events the guest is registered for
      const eventsResponse = await mockApiService.getEvents();
      const events = eventsResponse.success
        ? eventsResponse.data!.data.filter(event =>
            registrations.some(reg => reg.event === event.title)
          )
        : [];
      
      return {
        success: true,
        data: {
          guest,
          registrations,
          checkIns,
          hospitality,
          events,
        },
        message: 'Guest journey retrieved successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching guest journey'
      };
    }
  }
  
  // ==================== ANALYTICS & REPORTING WORKFLOW ====================
  
  /**
   * Generate comprehensive event report
   */
  async generateEventReport(eventId: string): Promise<WorkflowResponse<{
    event: Event;
    totalRegistrations: number;
    confirmedRegistrations: number;
    totalCheckIns: number;
    revenue: number;
    attendeeCategories: Record<string, number>;
  }>> {
    try {
      // Get event details
      const eventResponse = await mockApiService.getEvent(eventId);
      if (!eventResponse.success) {
        return { success: false, error: 'Event not found' };
      }
      
      const event = eventResponse.data!;
      
      // Get all registrations for this event
      const registrationsResponse = await mockApiService.getRegistrations();
      const allRegistrations = registrationsResponse.success ? registrationsResponse.data!.data : [];
      
      const eventRegistrations = allRegistrations.filter(reg => reg.event === event.title);
      
      // Calculate statistics
      const totalRegistrations = eventRegistrations.length;
      const confirmedRegistrations = eventRegistrations.filter(r => r.status === 'confirmed').length;
      const revenue = eventRegistrations
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
      
      // Get attendee categories
      const attendeeCategories: Record<string, number> = {};
      eventRegistrations.forEach(reg => {
        attendeeCategories[reg.category] = (attendeeCategories[reg.category] || 0) + 1;
      });
      
      // Get check-ins for this event
      const checkInsResponse = await mockApiService.getCheckIns();
      const totalCheckIns = checkInsResponse.success
        ? checkInsResponse.data!.data.filter(c => c.event === event.title).length
        : 0;
      
      return {
        success: true,
        data: {
          event,
          totalRegistrations,
          confirmedRegistrations,
          totalCheckIns,
          revenue,
          attendeeCategories,
        },
        message: 'Event report generated successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating event report'
      };
    }
  }
  
  /**
   * Get venue utilization report
   */
  async getVenueUtilizationReport(): Promise<WorkflowResponse<{
    venues: {
      id: string;
      name: string;
      capacity: number;
      currentOccupancy: number;
      utilizationPercent: number;
      status: string;
      events: Event[];
    }[];
    overallUtilization: number;
  }>> {
    try {
      const venuesResponse = await mockApiService.getVenues();
      if (!venuesResponse.success) {
        return { success: false, error: 'Failed to fetch venues' };
      }
      
      const venues = venuesResponse.data!.data;
      const eventsResponse = await mockApiService.getEvents();
      const allEvents = eventsResponse.success ? eventsResponse.data!.data : [];
      
      const venueReports = venues.map(venue => {
        const venueEvents = allEvents.filter(e => e.venueId === venue.id);
        const utilizationPercent = (venue.currentOccupancy / venue.capacity) * 100;
        
        return {
          id: venue.id,
          name: venue.name,
          capacity: venue.capacity,
          currentOccupancy: venue.currentOccupancy,
          utilizationPercent: Math.round(utilizationPercent * 100) / 100,
          status: venue.status,
          events: venueEvents,
        };
      });
      
      const overallUtilization = venueReports.reduce((sum, v) => sum + v.utilizationPercent, 0) / venueReports.length;
      
      return {
        success: true,
        data: {
          venues: venueReports,
          overallUtilization: Math.round(overallUtilization * 100) / 100,
        },
        message: 'Venue utilization report generated successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating venue report'
      };
    }
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();
export default workflowService;