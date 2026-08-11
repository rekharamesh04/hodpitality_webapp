export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'confirmed' | 'checked_in' | 'checked_out';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer' | 'reseller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  category: 'VIP' | 'Speaker' | 'Delegate' | 'Staff' | 'Press';
  status: Status;
  checkedIn: boolean;
  checkInTime?: string;
  registrationDate: string;
  avatar?: string;
  qrCode?: string;
  notes?: string;
  tags?: string[];
}

export interface CheckIn {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  checkInTime: string;
  checkInMethod: 'QR' | 'Manual' | 'Self';
  venue?: string;
  event?: string;
  badgePrinted: boolean;
  verifiedBy?: string;
  notes?: string;
}

export interface Registration {
  id: string;
  guestName: string;
  guestEmail: string;
  phone: string;
  event: string;
  registrationDate: string;
  status: Status;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  amount?: number;
  category: string;
}

export interface Hospitality {
  id: string;
  guestId: string;
  guestName: string;
  type: 'Hotel' | 'Transport' | 'Meal' | 'Airport Pickup' | 'Special Request';
  description: string;
  status: Status;
  bookingDate: string;
  serviceDate: string;
  venue?: string;
  notes?: string;
  cost?: number;
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  type: 'Conference Hall' | 'Meeting Room' | 'Auditorium' | 'Banquet' | 'Other';
  location: string;
  status: Status;
  amenities: string[];
  image?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  venueId: string;
  status: Status;
  attendees: number;
  capacity: number;
  category: string;
  organizer: string;
  image?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: Status;
  joinedDate: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DashboardStats {
  todayCheckIns: number;
  guestsArrived: number;
  pendingGuests: number;
  hospitalityBookings: number;
  venueOccupancy: number;
  totalGuests: number;
  totalEvents: number;
  activeStaff: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'check_in' | 'registration' | 'hospitality' | 'event' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  icon?: string;
}

export interface ChartData {
  name: string;
  value: number;
  label?: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: string;
  generatedBy: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  status: Status;
  downloadUrl?: string;
}

// ============ Hospitality Spa / Appointment types ============

export type MembershipTier = 'Founding' | 'Signature' | 'Standard';
export type AppointmentStatus = 'scheduled' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

export interface Customer {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  preferredContact: 'SMS' | 'Email' | 'Call';
  preferences: string;
  homeLocation: string;
  balance: number;
  tier: MembershipTier;
  memberSince: string;
  visits: number;
  upcomingCount: number;
  missedVisits: number;
  notes: string;
  hasAllergy?: boolean;
  allergyNote?: string;
  customerId: string;
  lastVisit?: string;
  nextAppointment?: string;
  photoUrl?: string;
}

export interface SpaAppointment {
  id: string;
  customerId: string;
  customerName: string;
  customerInitials: string;
  customerTier: MembershipTier;
  customerPhone: string;
  staffId: string;
  staffName: string;
  service: string;
  duration: number;
  room: string;
  date: string;
  startTime: string;
  status: AppointmentStatus;
  checkInTime?: string;
  checkOutTime?: string;
  cancelledTime?: string;
  noShowTime?: string;
}

export interface CalendarStaff {
  id: string;
  shortName: string;
  rooms: string;
}

export interface SpaService {
  id: string;
  name: string;
  duration: number;
  room: string;
}

export interface Settings {
  organization: {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
  branding: {
    primaryColor: string;
    logo?: string;
    favicon?: string;
  };
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
    enableQRCheckIn: boolean;
    enableBadgePrinting: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TableFilters {
  search?: string;
  status?: Status;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
