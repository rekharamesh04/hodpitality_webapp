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

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== GUESTS CRUD ====================
  
  async getGuests(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Guest>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/guests${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<Guest>>(endpoint);
  }

  async getGuest(id: string): Promise<ApiResponse<Guest>> {
    return this.request<Guest>(`/guests/${id}`);
  }

  async createGuest(guest: Omit<Guest, 'id'>): Promise<ApiResponse<Guest>> {
    return this.request<Guest>('/guests', {
      method: 'POST',
      body: JSON.stringify(guest),
    });
  }

  async updateGuest(id: string, guest: Partial<Guest>): Promise<ApiResponse<Guest>> {
    return this.request<Guest>(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(guest),
    });
  }

  async deleteGuest(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/guests/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkImportGuests(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<{ imported: number; errors: string[] }>('/guests/bulk-import', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    });
  }

  async exportGuests(format: 'csv' | 'xlsx' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>(`/guests/export?format=${format}`);
  }

  // ==================== CHECK-INS CRUD ====================

  async getCheckIns(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<CheckIn>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/check-ins${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<CheckIn>>(endpoint);
  }

  async createCheckIn(checkIn: Omit<CheckIn, 'id'>): Promise<ApiResponse<CheckIn>> {
    return this.request<CheckIn>('/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn),
    });
  }

  async checkInGuest(guestId: string, method: 'QR' | 'Manual' | 'Self', venue?: string): Promise<ApiResponse<CheckIn>> {
    return this.request<CheckIn>('/check-ins/quick', {
      method: 'POST',
      body: JSON.stringify({ guestId, method, venue }),
    });
  }

  async checkInByQr(qrCode: string, venue?: string): Promise<ApiResponse<CheckIn>> {
    return this.request<CheckIn>('/check-ins/qr', {
      method: 'POST',
      body: JSON.stringify({ qrCode, venue }),
    });
  }

  async printBadge(checkInId: string): Promise<ApiResponse<{ printed: boolean }>> {
    return this.request<{ printed: boolean }>(`/check-ins/${checkInId}/print-badge`, {
      method: 'POST',
    });
  }

  // ==================== REGISTRATIONS CRUD ====================

  async getRegistrations(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Registration>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/registrations${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<Registration>>(endpoint);
  }

  async getRegistration(id: string): Promise<ApiResponse<Registration>> {
    return this.request<Registration>(`/registrations/${id}`);
  }

  async createRegistration(registration: Omit<Registration, 'id'>): Promise<ApiResponse<Registration>> {
    return this.request<Registration>('/registrations', {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  }

  async updateRegistration(id: string, registration: Partial<Registration>): Promise<ApiResponse<Registration>> {
    return this.request<Registration>(`/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(registration),
    });
  }

  async deleteRegistration(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/registrations/${id}`, {
      method: 'DELETE',
    });
  }

  async confirmRegistration(id: string): Promise<ApiResponse<Registration>> {
    return this.request<Registration>(`/registrations/${id}/confirm`, {
      method: 'POST',
    });
  }

  async updatePaymentStatus(id: string, status: 'paid' | 'pending' | 'failed' | 'refunded'): Promise<ApiResponse<Registration>> {
    return this.request<Registration>(`/registrations/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // ==================== HOSPITALITY CRUD ====================

  async getHospitality(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Hospitality>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/hospitality${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<Hospitality>>(endpoint);
  }

  async getHospitalityById(id: string): Promise<ApiResponse<Hospitality>> {
    return this.request<Hospitality>(`/hospitality/${id}`);
  }

  async createHospitality(hospitality: Omit<Hospitality, 'id'>): Promise<ApiResponse<Hospitality>> {
    return this.request<Hospitality>('/hospitality', {
      method: 'POST',
      body: JSON.stringify(hospitality),
    });
  }

  async updateHospitality(id: string, hospitality: Partial<Hospitality>): Promise<ApiResponse<Hospitality>> {
    return this.request<Hospitality>(`/hospitality/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hospitality),
    });
  }

  async deleteHospitality(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/hospitality/${id}`, {
      method: 'DELETE',
    });
  }

  async getGuestHospitality(guestId: string): Promise<ApiResponse<Hospitality[]>> {
    return this.request<Hospitality[]>(`/hospitality/guest/${guestId}`);
  }

  // ==================== VENUES CRUD ====================

  async getVenues(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Venue>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/venues${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<Venue>>(endpoint);
  }

  async getVenue(id: string): Promise<ApiResponse<Venue>> {
    return this.request<Venue>(`/venues/${id}`);
  }

  async createVenue(venue: Omit<Venue, 'id'>): Promise<ApiResponse<Venue>> {
    return this.request<Venue>('/venues', {
      method: 'POST',
      body: JSON.stringify(venue),
    });
  }

  async updateVenue(id: string, venue: Partial<Venue>): Promise<ApiResponse<Venue>> {
    return this.request<Venue>(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(venue),
    });
  }

  async deleteVenue(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/venues/${id}`, {
      method: 'DELETE',
    });
  }

  async updateVenueOccupancy(id: string, occupancy: number): Promise<ApiResponse<Venue>> {
    return this.request<Venue>(`/venues/${id}/occupancy`, {
      method: 'PUT',
      body: JSON.stringify({ occupancy }),
    });
  }

  // ==================== EVENTS CRUD ====================

  async getEvents(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/events${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<Event>>(endpoint);
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<ApiResponse<Event>> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEventAttendees(eventId: string): Promise<ApiResponse<Guest[]>> {
    return this.request<Guest[]>(`/events/${eventId}/attendees`);
  }

  // ==================== STAFF CRUD ====================

  async getStaff(filters?: TableFilters): Promise<ApiResponse<PaginatedResponse<Staff>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/staff${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResponse<Staff>>(endpoint);
  }

  async getStaffMember(id: string): Promise<ApiResponse<Staff>> {
    return this.request<Staff>(`/staff/${id}`);
  }

  async createStaff(staff: Omit<Staff, 'id'>): Promise<ApiResponse<Staff>> {
    return this.request<Staff>('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  }

  async updateStaff(id: string, staff: Partial<Staff>): Promise<ApiResponse<Staff>> {
    return this.request<Staff>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    });
  }

  async deleteStaff(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getActivityFeed(limit = 10): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/dashboard/activity?limit=${limit}`);
  }

  async getChartData(type: 'checkin-trends' | 'guest-categories' | 'venue-utilization' | 'monthly-stats'): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/dashboard/charts/${type}`);
  }

  // ==================== NOTIFICATIONS ====================

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.request<void>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // ==================== REPORTS ====================

  async generateReport(type: 'guests' | 'checkins' | 'registrations' | 'hospitality', format: 'PDF' | 'CSV' | 'XLSX' = 'PDF', filters?: any): Promise<ApiResponse<{ reportId: string }>> {
    return this.request<{ reportId: string }>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, format, filters }),
    });
  }

  async getReports(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/reports');
  }

  async downloadReport(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>(`/reports/${id}/download`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;