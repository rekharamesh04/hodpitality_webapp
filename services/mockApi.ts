import type {
  Guest,
  CheckIn,
  Registration,
  Hospitality,
  Venue,
  Event,
  Staff,
  Notification,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  TableFilters,
} from '@/types';
import {
  mockGuests,
  mockCheckIns,
  mockRegistrations,
  mockHospitality,
  mockVenues,
  mockEvents,
  mockStaff,
  mockNotifications,
  mockDashboardStats,
  mockActivityFeed,
  mockCheckInTrends,
  mockGuestCategories,
  mockVenueUtilization,
  mockMonthlyStats,
} from '@/constants/mock-data';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mock data stores (in real app, this would be your database)
let guestStore = [...mockGuests];
let checkInStore = [...mockCheckIns];
let registrationStore = [...mockRegistrations];
let hospitalityStore = [...mockHospitality];
let venueStore = [...mockVenues];
let eventStore = [...mockEvents];
let staffStore = [...mockStaff];
let notificationStore = [...mockNotifications];

// Filter and pagination helper
function paginate<T>(
  data: T[],
  filters: TableFilters = {},
  searchFields: (keyof T)[] = []
): PaginatedResponse<T> {
  let filtered = [...data];

  // Search filter
  if (filters.search && searchFields.length > 0) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(searchTerm);
      })
    );
  }

  // Status filter
  if (filters.status) {
    filtered = filtered.filter((item: any) => item.status === filters.status);
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter((item: any) => item.category === filters.category);
  }

  // Date filters
  if (filters.dateFrom) {
    filtered = filtered.filter((item: any) => 
      new Date(item.registrationDate || item.createdAt) >= new Date(filters.dateFrom!)
    );
  }
  if (filters.dateTo) {
    filtered = filtered.filter((item: any) => 
      new Date(item.registrationDate || item.createdAt) <= new Date(filters.dateTo!)
    );
  }

  // Sorting
  if (filters.sortBy && filters.sortOrder) {
    filtered.sort((a: any, b: any) => {
      const aValue = a[filters.sortBy!];
      const bValue = b[filters.sortBy!];
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  // Pagination
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: filtered.slice(startIndex, endIndex),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// Mock API Service
class MockApiService {
  // ==================== GUESTS CRUD ====================
  
  async getGuests(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Guest>>> {
    await delay();
    try {
      const result = paginate(guestStore, filters, ['name', 'email', 'company', 'designation']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch guests' };
    }
  }

  async getGuest(id: string): Promise<ApiResponse<Guest>> {
    await delay();
    const guest = guestStore.find(g => g.id === id);
    if (!guest) {
      return { success: false, error: 'Guest not found' };
    }
    return { success: true, data: guest };
  }

  async createGuest(guestData: Omit<Guest, 'id'>): Promise<ApiResponse<Guest>> {
    await delay();
    try {
      const newGuest: Guest = {
        ...guestData,
        id: generateId(),
        registrationDate: new Date().toISOString(),
        checkedIn: false,
        qrCode: `QR${generateId().toUpperCase()}`,
      };
      guestStore.push(newGuest);
      
      // Create notification
      this.addNotification({
        title: 'New Guest Added',
        message: `${newGuest.name} has been registered`,
        type: 'info',
      });
      
      return { success: true, data: newGuest };
    } catch (error) {
      return { success: false, error: 'Failed to create guest' };
    }
  }
  async updateGuest(id: string, updates: Partial<Guest>): Promise<ApiResponse<Guest>> {
    await delay();
    const index = guestStore.findIndex(g => g.id === id);
    if (index === -1) {
      return { success: false, error: 'Guest not found' };
    }
    
    guestStore[index] = { ...guestStore[index], ...updates };
    return { success: true, data: guestStore[index] };
  }

  async deleteGuest(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = guestStore.findIndex(g => g.id === id);
    if (index === -1) {
      return { success: false, error: 'Guest not found' };
    }
    
    const guest = guestStore[index];
    guestStore.splice(index, 1);
    
    // Remove related records
    checkInStore = checkInStore.filter(c => c.guestId !== id);
    hospitalityStore = hospitalityStore.filter(h => h.guestId !== id);
    
    this.addNotification({
      title: 'Guest Removed',
      message: `${guest.name} has been removed from the system`,
      type: 'warning',
    });
    
    return { success: true };
  }

  async bulkImportGuests(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    await delay(1500); // Simulate file processing time
    
    // Mock import process
    const mockImportedCount = Math.floor(Math.random() * 50) + 10;
    const mockErrors: string[] = [];
    
    // Simulate some import errors
    if (Math.random() > 0.7) {
      mockErrors.push('Row 5: Invalid email format');
      mockErrors.push('Row 12: Missing required field "name"');
    }
    
    this.addNotification({
      title: 'Bulk Import Complete',
      message: `${mockImportedCount} guests imported successfully`,
      type: 'success',
    });
    
    return {
      success: true,
      data: { imported: mockImportedCount, errors: mockErrors }
    };
  }

  async exportGuests(format: 'csv' | 'xlsx' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    await delay(1000);
    
    // Mock export URL
    const downloadUrl = `/api/exports/guests_${Date.now()}.${format}`;
    
    return {
      success: true,
      data: { downloadUrl }
    };
  }
  // ==================== CHECK-INS CRUD ====================

  async getCheckIns(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<CheckIn>>> {
    await delay();
    try {
      const result = paginate(checkInStore, filters, ['guestName', 'guestEmail', 'venue']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch check-ins' };
    }
  }

  async createCheckIn(checkInData: Omit<CheckIn, 'id'>): Promise<ApiResponse<CheckIn>> {
    await delay();
    try {
      const newCheckIn: CheckIn = {
        ...checkInData,
        id: generateId(),
        checkInTime: new Date().toISOString(),
        badgePrinted: false,
      };
      
      checkInStore.push(newCheckIn);
      
      // Update guest status
      const guestIndex = guestStore.findIndex(g => g.id === checkInData.guestId);
      if (guestIndex !== -1) {
        guestStore[guestIndex].checkedIn = true;
        guestStore[guestIndex].checkInTime = newCheckIn.checkInTime;
      }
      
      this.addNotification({
        title: 'Guest Checked In',
        message: `${checkInData.guestName} has checked in`,
        type: 'success',
      });
      
      return { success: true, data: newCheckIn };
    } catch (error) {
      return { success: false, error: 'Failed to create check-in' };
    }
  }

  async checkInGuest(guestId: string, method: 'QR' | 'Manual' | 'Self', venue?: string): Promise<ApiResponse<CheckIn>> {
    await delay();
    
    const guest = guestStore.find(g => g.id === guestId);
    if (!guest) {
      return { success: false, error: 'Guest not found' };
    }
    
    if (guest.checkedIn) {
      return { success: false, error: 'Guest already checked in' };
    }
    
    const checkInData: Omit<CheckIn, 'id'> = {
      guestId,
      guestName: guest.name,
      guestEmail: guest.email,
      checkInTime: new Date().toISOString(),
      checkInMethod: method,
      venue: venue || 'Main Hall',
      badgePrinted: false,
      verifiedBy: 'System User',
    };
    
    return this.createCheckIn(checkInData);
  }

  async checkInByQr(qrCode: string, venue?: string): Promise<ApiResponse<CheckIn>> {
    await delay();
    
    const guest = guestStore.find(g => g.qrCode === qrCode);
    if (!guest) {
      return { success: false, error: 'Invalid QR code' };
    }
    
    return this.checkInGuest(guest.id, 'QR', venue);
  }
  async printBadge(checkInId: string): Promise<ApiResponse<{ printed: boolean }>> {
    await delay();
    
    const checkInIndex = checkInStore.findIndex(c => c.id === checkInId);
    if (checkInIndex === -1) {
      return { success: false, error: 'Check-in record not found' };
    }
    
    checkInStore[checkInIndex].badgePrinted = true;
    
    this.addNotification({
      title: 'Badge Printed',
      message: `Badge printed for ${checkInStore[checkInIndex].guestName}`,
      type: 'info',
    });
    
    return { success: true, data: { printed: true } };
  }

  // ==================== REGISTRATIONS CRUD ====================

  async getRegistrations(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Registration>>> {
    await delay();
    try {
      const result = paginate(registrationStore, filters, ['guestName', 'guestEmail', 'event']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch registrations' };
    }
  }

  async getRegistration(id: string): Promise<ApiResponse<Registration>> {
    await delay();
    const registration = registrationStore.find(r => r.id === id);
    if (!registration) {
      return { success: false, error: 'Registration not found' };
    }
    return { success: true, data: registration };
  }

  async createRegistration(regData: Omit<Registration, 'id'>): Promise<ApiResponse<Registration>> {
    await delay();
    try {
      const newRegistration: Registration = {
        ...regData,
        id: generateId(),
        registrationDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'pending',
      };
      
      registrationStore.push(newRegistration);
      
      this.addNotification({
        title: 'New Registration',
        message: `${regData.guestName} registered for ${regData.event}`,
        type: 'info',
      });
      
      return { success: true, data: newRegistration };
    } catch (error) {
      return { success: false, error: 'Failed to create registration' };
    }
  }

  async updateRegistration(id: string, updates: Partial<Registration>): Promise<ApiResponse<Registration>> {
    await delay();
    const index = registrationStore.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Registration not found' };
    }
    
    registrationStore[index] = { ...registrationStore[index], ...updates };
    return { success: true, data: registrationStore[index] };
  }
  async deleteRegistration(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = registrationStore.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Registration not found' };
    }
    
    const registration = registrationStore[index];
    registrationStore.splice(index, 1);
    
    this.addNotification({
      title: 'Registration Cancelled',
      message: `Registration for ${registration.guestName} has been cancelled`,
      type: 'warning',
    });
    
    return { success: true };
  }

  async confirmRegistration(id: string): Promise<ApiResponse<Registration>> {
    await delay();
    const index = registrationStore.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Registration not found' };
    }
    
    registrationStore[index].status = 'confirmed';
    
    this.addNotification({
      title: 'Registration Confirmed',
      message: `Registration for ${registrationStore[index].guestName} has been confirmed`,
      type: 'success',
    });
    
    return { success: true, data: registrationStore[index] };
  }

  async updatePaymentStatus(id: string, status: 'paid' | 'pending' | 'failed' | 'refunded'): Promise<ApiResponse<Registration>> {
    await delay();
    const index = registrationStore.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Registration not found' };
    }
    
    registrationStore[index].paymentStatus = status;
    
    this.addNotification({
      title: 'Payment Updated',
      message: `Payment status updated to ${status} for ${registrationStore[index].guestName}`,
      type: status === 'paid' ? 'success' : 'info',
    });
    
    return { success: true, data: registrationStore[index] };
  }

  // ==================== HOSPITALITY CRUD ====================

  async getHospitality(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Hospitality>>> {
    await delay();
    try {
      const result = paginate(hospitalityStore, filters, ['guestName', 'type', 'description']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch hospitality records' };
    }
  }
  async getHospitalityById(id: string): Promise<ApiResponse<Hospitality>> {
    await delay();
    const hospitality = hospitalityStore.find(h => h.id === id);
    if (!hospitality) {
      return { success: false, error: 'Hospitality record not found' };
    }
    return { success: true, data: hospitality };
  }

  async createHospitality(hospData: Omit<Hospitality, 'id'>): Promise<ApiResponse<Hospitality>> {
    await delay();
    try {
      const newHospitality: Hospitality = {
        ...hospData,
        id: generateId(),
        bookingDate: new Date().toISOString(),
        status: 'pending',
      };
      
      hospitalityStore.push(newHospitality);
      
      this.addNotification({
        title: 'Hospitality Booking',
        message: `${hospData.type} booked for ${hospData.guestName}`,
        type: 'info',
      });
      
      return { success: true, data: newHospitality };
    } catch (error) {
      return { success: false, error: 'Failed to create hospitality booking' };
    }
  }

  async updateHospitality(id: string, updates: Partial<Hospitality>): Promise<ApiResponse<Hospitality>> {
    await delay();
    const index = hospitalityStore.findIndex(h => h.id === id);
    if (index === -1) {
      return { success: false, error: 'Hospitality record not found' };
    }
    
    hospitalityStore[index] = { ...hospitalityStore[index], ...updates };
    return { success: true, data: hospitalityStore[index] };
  }

  async deleteHospitality(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = hospitalityStore.findIndex(h => h.id === id);
    if (index === -1) {
      return { success: false, error: 'Hospitality record not found' };
    }
    
    const hospitality = hospitalityStore[index];
    hospitalityStore.splice(index, 1);
    
    this.addNotification({
      title: 'Hospitality Cancelled',
      message: `${hospitality.type} booking cancelled for ${hospitality.guestName}`,
      type: 'warning',
    });
    
    return { success: true };
  }

  async getGuestHospitality(guestId: string): Promise<ApiResponse<Hospitality[]>> {
    await delay();
    const guestHospitality = hospitalityStore.filter(h => h.guestId === guestId);
    return { success: true, data: guestHospitality };
  }
  // ==================== VENUES CRUD ====================

  async getVenues(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Venue>>> {
    await delay();
    try {
      const result = paginate(venueStore, filters, ['name', 'type', 'location']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch venues' };
    }
  }

  async getVenue(id: string): Promise<ApiResponse<Venue>> {
    await delay();
    const venue = venueStore.find(v => v.id === id);
    if (!venue) {
      return { success: false, error: 'Venue not found' };
    }
    return { success: true, data: venue };
  }

  async createVenue(venueData: Omit<Venue, 'id'>): Promise<ApiResponse<Venue>> {
    await delay();
    try {
      const newVenue: Venue = {
        ...venueData,
        id: generateId(),
        currentOccupancy: 0,
        status: 'active',
      };
      
      venueStore.push(newVenue);
      
      this.addNotification({
        title: 'New Venue Added',
        message: `${newVenue.name} has been added to the system`,
        type: 'success',
      });
      
      return { success: true, data: newVenue };
    } catch (error) {
      return { success: false, error: 'Failed to create venue' };
    }
  }

  async updateVenue(id: string, updates: Partial<Venue>): Promise<ApiResponse<Venue>> {
    await delay();
    const index = venueStore.findIndex(v => v.id === id);
    if (index === -1) {
      return { success: false, error: 'Venue not found' };
    }
    
    venueStore[index] = { ...venueStore[index], ...updates };
    return { success: true, data: venueStore[index] };
  }

  async deleteVenue(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = venueStore.findIndex(v => v.id === id);
    if (index === -1) {
      return { success: false, error: 'Venue not found' };
    }
    
    const venue = venueStore[index];
    venueStore.splice(index, 1);
    
    this.addNotification({
      title: 'Venue Removed',
      message: `${venue.name} has been removed from the system`,
      type: 'warning',
    });
    
    return { success: true };
  }
  async updateVenueOccupancy(id: string, occupancy: number): Promise<ApiResponse<Venue>> {
    await delay();
    const index = venueStore.findIndex(v => v.id === id);
    if (index === -1) {
      return { success: false, error: 'Venue not found' };
    }
    
    venueStore[index].currentOccupancy = occupancy;
    
    // Check for capacity warnings
    const venue = venueStore[index];
    const occupancyPercent = (occupancy / venue.capacity) * 100;
    
    if (occupancyPercent >= 90) {
      this.addNotification({
        title: 'Venue Near Capacity',
        message: `${venue.name} is at ${occupancyPercent.toFixed(0)}% capacity`,
        type: 'warning',
      });
    }
    
    return { success: true, data: venueStore[index] };
  }

  // ==================== EVENTS CRUD ====================

  async getEvents(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Event>>> {
    await delay();
    try {
      const result = paginate(eventStore, filters, ['title', 'description', 'venue', 'organizer']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch events' };
    }
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    await delay();
    const event = eventStore.find(e => e.id === id);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    return { success: true, data: event };
  }

  async createEvent(eventData: Omit<Event, 'id'>): Promise<ApiResponse<Event>> {
    await delay();
    try {
      const newEvent: Event = {
        ...eventData,
        id: generateId(),
        attendees: 0,
        status: 'active',
      };
      
      eventStore.push(newEvent);
      
      this.addNotification({
        title: 'New Event Created',
        message: `${newEvent.title} has been scheduled`,
        type: 'success',
      });
      
      return { success: true, data: newEvent };
    } catch (error) {
      return { success: false, error: 'Failed to create event' };
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<ApiResponse<Event>> {
    await delay();
    const index = eventStore.findIndex(e => e.id === id);
    if (index === -1) {
      return { success: false, error: 'Event not found' };
    }
    
    eventStore[index] = { ...eventStore[index], ...updates };
    return { success: true, data: eventStore[index] };
  }
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = eventStore.findIndex(e => e.id === id);
    if (index === -1) {
      return { success: false, error: 'Event not found' };
    }
    
    const event = eventStore[index];
    eventStore.splice(index, 1);
    
    this.addNotification({
      title: 'Event Cancelled',
      message: `${event.title} has been cancelled`,
      type: 'error',
    });
    
    return { success: true };
  }

  async getEventAttendees(eventId: string): Promise<ApiResponse<Guest[]>> {
    await delay();
    
    // Mock: find guests registered for this event
    const eventRegistrations = registrationStore.filter(r => 
      eventStore.find(e => e.id === eventId && e.title === r.event)
    );
    
    const attendees = eventRegistrations
      .map(reg => guestStore.find(g => g.email === reg.guestEmail))
      .filter(Boolean) as Guest[];
    
    return { success: true, data: attendees };
  }

  // ==================== STAFF CRUD ====================

  async getStaff(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Staff>>> {
    await delay();
    try {
      const result = paginate(staffStore, filters, ['name', 'email', 'department']);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'Failed to fetch staff' };
    }
  }

  async getStaffMember(id: string): Promise<ApiResponse<Staff>> {
    await delay();
    const staff = staffStore.find(s => s.id === id);
    if (!staff) {
      return { success: false, error: 'Staff member not found' };
    }
    return { success: true, data: staff };
  }

  async createStaff(staffData: Omit<Staff, 'id'>): Promise<ApiResponse<Staff>> {
    await delay();
    try {
      const newStaff: Staff = {
        ...staffData,
        id: generateId(),
        joinedDate: new Date().toISOString(),
        status: 'active',
      };
      
      staffStore.push(newStaff);
      
      this.addNotification({
        title: 'New Staff Added',
        message: `${newStaff.name} has joined the team`,
        type: 'success',
      });
      
      return { success: true, data: newStaff };
    } catch (error) {
      return { success: false, error: 'Failed to add staff member' };
    }
  }
  async updateStaff(id: string, updates: Partial<Staff>): Promise<ApiResponse<Staff>> {
    await delay();
    const index = staffStore.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Staff member not found' };
    }
    
    staffStore[index] = { ...staffStore[index], ...updates };
    return { success: true, data: staffStore[index] };
  }

  async deleteStaff(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = staffStore.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Staff member not found' };
    }
    
    const staff = staffStore[index];
    staffStore.splice(index, 1);
    
    this.addNotification({
      title: 'Staff Removed',
      message: `${staff.name} has been removed from the team`,
      type: 'warning',
    });
    
    return { success: true };
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await delay();
    
    // Calculate real-time stats from current data
    const stats: DashboardStats = {
      todayCheckIns: checkInStore.filter(c => 
        new Date(c.checkInTime).toDateString() === new Date().toDateString()
      ).length,
      guestsArrived: checkInStore.length,
      pendingGuests: guestStore.filter(g => !g.checkedIn).length,
      hospitalityBookings: hospitalityStore.length,
      venueOccupancy: Math.round(
        venueStore.reduce((acc, v) => acc + (v.currentOccupancy / v.capacity), 0) / venueStore.length * 100
      ),
      totalGuests: guestStore.length,
      totalEvents: eventStore.length,
      activeStaff: staffStore.filter(s => s.status === 'active').length,
    };
    
    return { success: true, data: stats };
  }

  async getActivityFeed(limit = 10): Promise<ApiResponse<any[]>> {
    await delay();
    
    // Sort by timestamp and limit
    const sortedActivities = [...mockActivityFeed]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return { success: true, data: sortedActivities };
  }

  async getChartData(type: string): Promise<ApiResponse<any[]>> {
    await delay();
    
    let data;
    switch (type) {
      case 'checkin-trends':
        data = mockCheckInTrends;
        break;
      case 'guest-categories':
        data = mockGuestCategories;
        break;
      case 'venue-utilization':
        data = mockVenueUtilization;
        break;
      case 'monthly-stats':
        data = mockMonthlyStats;
        break;
      default:
        return { success: false, error: 'Invalid chart type' };
    }
    
    return { success: true, data };
  }
  // ==================== NOTIFICATIONS ====================

  private addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    notificationStore.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (notificationStore.length > 50) {
      notificationStore = notificationStore.slice(0, 50);
    }
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await delay();
    return { success: true, data: [...notificationStore] };
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    await delay();
    const index = notificationStore.findIndex(n => n.id === id);
    if (index !== -1) {
      notificationStore[index].read = true;
    }
    return { success: true };
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    await delay();
    notificationStore.forEach(n => n.read = true);
    return { success: true };
  }

  // ==================== REPORTS ====================

  async generateReport(type: string, format: string = 'PDF', filters?: any): Promise<ApiResponse<{ reportId: string }>> {
    await delay(2000); // Simulate report generation time
    
    const reportId = `report_${generateId()}`;
    
    this.addNotification({
      title: 'Report Generated',
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} report (${format}) is ready for download`,
      type: 'success',
    });
    
    return { success: true, data: { reportId } };
  }

  async getReports(): Promise<ApiResponse<any[]>> {
    await delay();
    
    // Mock reports list
    const mockReports = [
      {
        id: 'report_1',
        title: 'Guest Report - January',
        type: 'guests',
        generatedAt: '2024-01-15T10:00:00Z',
        generatedBy: 'Admin User',
        format: 'PDF',
        status: 'completed',
        downloadUrl: '/api/reports/report_1/download'
      },
      {
        id: 'report_2',
        title: 'Check-in Report - Weekly',
        type: 'checkins',
        generatedAt: '2024-01-14T15:30:00Z',
        generatedBy: 'Manager User',
        format: 'CSV',
        status: 'completed',
        downloadUrl: '/api/reports/report_2/download'
      },
    ];
    
    return { success: true, data: mockReports };
  }

  async downloadReport(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    await delay();
    
    const downloadUrl = `/api/reports/${id}/download?token=${generateId()}`;
    
    return { success: true, data: { downloadUrl } };
  }
}

// Export singleton instance
export const mockApiService = new MockApiService();
export default mockApiService;