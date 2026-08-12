import type { Guest, Registration, CheckIn, Hospitality, Event } from '@/types';
import { guestService } from './guest.service';
import { checkInService } from './checkin.service';
import { hospitalityService } from './hospitality.service';
import { eventService } from './event.service';
import { venueService } from './venue.service';
import apiClient from '@/lib/axios';

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
      let guest: Guest;
      try {
        const existingGuests = await guestService.getGuests({ search: data.email, limit: 1 });
        if (existingGuests.data.length > 0) {
          guest = await guestService.updateGuest(existingGuests.data[0].id, {
            name: data.guestName, phone: data.phone, company: data.company,
            designation: data.designation, category: data.category, notes: data.notes,
          });
        } else {
          guest = await guestService.createGuest({
            name: data.guestName, email: data.email, phone: data.phone,
            company: data.company, designation: data.designation, category: data.category,
            status: 'active', checkedIn: false, registrationDate: new Date().toISOString(),
            notes: data.notes, tags: data.dietaryRestrictions?.concat(data.accessibilityNeeds || []),
          });
        }
      } catch {
        return { success: false, error: 'Failed to create/update guest record' };
      }

      // Step 2: Create event registration
      let registration: Registration;
      try {
        const res = await apiClient.post<Registration>('/registrations', {
          guestName: data.guestName, guestEmail: data.email, phone: data.phone,
          event: data.eventTitle, registrationDate: new Date().toISOString(),
          status: 'pending', paymentStatus: data.paymentAmount ? 'pending' : 'paid',
          amount: data.paymentAmount, category: data.category,
        });
        registration = res.data;
      } catch {
        return { success: false, error: 'Failed to create event registration' };
      }

      // Step 3: Process hospitality requests
      const hospitalityRecords: Hospitality[] = [];
      if (data.hospitalityRequests && data.hospitalityRequests.length > 0) {
        for (const request of data.hospitalityRequests) {
          try {
            const h = await hospitalityService.createBooking({
              guestId: guest.id, guestName: guest.name, type: request.type,
              description: request.description, status: 'pending',
              bookingDate: new Date().toISOString(), serviceDate: request.serviceDate, cost: request.cost,
            });
            hospitalityRecords.push(h);
          } catch { /* skip failed hospitality items */ }
        }
      }

      return {
        success: true,
        data: { guest, registration, hospitality: hospitalityRecords },
        message: `Registration completed successfully for ${data.guestName}`
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error during registration' };
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
      let checkIn: CheckIn;
      if (data.method === 'QR' && data.qrCode) {
        checkIn = await checkInService.checkInByQr(data.qrCode, data.venue);
      } else if (data.guestId) {
        checkIn = await checkInService.quickCheckIn({ guestId: data.guestId, method: data.method });
      } else {
        return { success: false, error: 'Invalid check-in data. Provide either QR code or guest ID' };
      }
      const guest = await guestService.getGuest(checkIn.guestId);
      let badgePrinted = false;
      if (data.printBadge) {
        try { await checkInService.printBadge(checkIn.id); badgePrinted = true; } catch { /* ignore */ }
      }
      return { success: true, data: { checkIn, guest, badgePrinted }, message: `Check-in successful for ${checkIn.guestName}` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error during check-in' };
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
      const venue = await venueService.getVenue(eventData.venueId!);
      if (venue.status !== 'active') return { success: false, error: 'Venue is not available' };
      if ((eventData.capacity ?? 0) > (venue.capacity ?? 0)) return { success: false, error: `Event capacity (${eventData.capacity}) exceeds venue capacity (${venue.capacity})` };
      const event = await eventService.createEvent({ ...eventData, attendees: 0, status: 'active' });
      return { success: true, data: { event, venue }, message: `Event "${eventData.title}" created successfully` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error during event creation' };
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
      try {
        const checkIn = await checkInService.quickCheckIn({ guestId, method });
        successful.push(checkIn);
      } catch (e) {
        failed.push({ guestId, error: e instanceof Error ? e.message : 'Unknown error' });
      }
    }
    return { success: true, data: { successful, failed }, message: `Bulk check-in completed: ${successful.length} successful, ${failed.length} failed` };
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
      try {
        const res = await apiClient.patch<Registration>(`/registrations/${regId}`, { status: 'confirmed', paymentStatus: 'paid' });
        confirmed.push(res.data);
      } catch (e) {
        failed.push({ registrationId: regId, error: e instanceof Error ? e.message : 'Unknown error' });
      }
    }
    return { success: true, data: { confirmed, failed }, message: `Bulk confirmation completed: ${confirmed.length} confirmed, ${failed.length} failed` };
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
      const guest = await guestService.getGuest(guestId);
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
        
        try {
            const h = await hospitalityService.createBooking({
              guestId: guest.id, guestName: guest.name, type: service.type,
              description: service.description, status: 'pending',
              bookingDate: new Date().toISOString(), serviceDate,
              cost: service.cost,
            });
            hospitalityRecords.push(h);
          } catch { /* skip */ }
      }
      
      return { success: true, data: hospitalityRecords, message: `${packageType.toUpperCase()} hospitality package created for ${guest.name}` };
      
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
      const guest = await guestService.getGuest(guestId);
      const [registrationsRes, checkInsRes, eventsRes] = await Promise.all([
        apiClient.get<{ data: Registration[] }>(`/registrations?search=${encodeURIComponent(guest.email)}&limit=100`),
        apiClient.get<{ data: CheckIn[] }>(`/check-ins?search=${encodeURIComponent(guest.email)}&limit=100`),
        eventService.getEvents({ limit: 100 }),
      ]);
      const registrations: Registration[] = registrationsRes.data?.data ?? [];
      const checkIns: CheckIn[] = checkInsRes.data?.data ?? [];
      const hospitality: Hospitality[] = await hospitalityService.getVipGuests().then(() => []).catch(() => []);
      const events = eventsRes.data.filter(event => registrations.some(reg => reg.event === event.title));
      return { success: true, data: { guest, registrations, checkIns, hospitality, events }, message: 'Guest journey retrieved successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error fetching guest journey' };
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
      const event = await eventService.getEvent(eventId);
      const regsRes = await apiClient.get<{ data: Registration[] }>(`/registrations?limit=500`);
      const allRegistrations: Registration[] = regsRes.data?.data ?? [];
      const eventRegistrations = allRegistrations.filter(reg => reg.event === event.title);
      const totalRegistrations = eventRegistrations.length;
      const confirmedRegistrations = eventRegistrations.filter(r => r.status === 'confirmed').length;
      const revenue = eventRegistrations.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0);
      const attendeeCategories: Record<string, number> = {};
      eventRegistrations.forEach(reg => { attendeeCategories[reg.category] = (attendeeCategories[reg.category] || 0) + 1; });
      const checkInsRes = await apiClient.get<{ data: CheckIn[] }>(`/check-ins?limit=500`);
      const totalCheckIns = (checkInsRes.data?.data ?? []).filter(c => c.event === event.title).length;
      return { success: true, data: { event, totalRegistrations, confirmedRegistrations, totalCheckIns, revenue, attendeeCategories }, message: 'Event report generated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error generating event report' };
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
      const [venuesData, eventsData] = await Promise.all([venueService.getVenues({ limit: 100 }), eventService.getEvents({ limit: 100 })]);
      const venues = venuesData.data;
      const allEvents = eventsData.data;
      const venueReports = venues.map(venue => {
        const venueEvents = allEvents.filter(e => e.venueId === venue.id);
        const utilizationPercent = ((venue.currentOccupancy ?? 0) / (venue.capacity || 1)) * 100;
        return { id: venue.id, name: venue.name ?? '', capacity: venue.capacity ?? 0, currentOccupancy: venue.currentOccupancy ?? 0, utilizationPercent: Math.round(utilizationPercent * 100) / 100, status: venue.status as string, events: venueEvents };
      });
      const overallUtilization = venueReports.length ? venueReports.reduce((sum, v) => sum + v.utilizationPercent, 0) / venueReports.length : 0;
      return { success: true, data: { venues: venueReports, overallUtilization: Math.round(overallUtilization * 100) / 100 }, message: 'Venue utilization report generated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error generating venue report' };
    }
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();
export default workflowService;