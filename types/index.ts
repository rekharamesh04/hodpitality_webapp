export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'confirmed' | 'checked_in' | 'checked_out';

export type UserRole =
  | 'super_admin'     // sees everything: resellers + companies + all ops
  | 'reseller_admin'  // sees companies under their reseller + all ops
  | 'company_admin'   // sees only their company's ops tabs
  | 'admin'
  | 'manager'
  | 'staff'
  | 'viewer'
  | 'reseller';

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
  PK?: string;
  entity_type?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  category: 'VIP' | 'Speaker' | 'Delegate' | 'Staff' | 'Press' | 'regular' | 'standard';
  status: Status;
  checkedIn: boolean;
  checkInTime?: string;
  registrationDate?: string;
  createdAt?: string;
  avatar?: string;
  qrCode?: string;
  notes?: string;
  tags?: string[];
}

export interface CheckIn {
  id: string;
  PK?: string;
  entity_type?: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  checkInTime: string;
  checkInMethod: 'QR' | 'Manual' | 'Self';
  /** Raw API field */
  method?: string;
  /** Raw API ISO timestamp */
  timestamp?: string;
  venue?: string;
  event?: string;
  badgePrinted: boolean;
  verifiedBy?: string;
  notes?: string;
}

export interface CheckInStats {
  expected: number;
  arrived: number;
  onSite: number;
  completed: number;
  noShows: number;
  cancelled: number;
}

export interface Registration {
  id: string;
  guestName: string;
  guestEmail: string;
  phone: string;
  event: string;
  registrationDate?: string;
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
  PK?: string;
  entity_type?: string;
  name?: string;
  capacity: number;
  /** Raw API field – prefer over currentOccupancy */
  occupancy?: number;
  currentOccupancy?: number;
  type?: string;
  location?: string;
  status: Status;
  amenities: string[];
  image?: string;
}

export interface Event {
  id: string;
  PK?: string;
  entity_type?: string;
  is_deleted?: boolean;
  title: string;
  description?: string;
  startDate: string;
  /** Raw API date field */
  date?: string;
  endDate?: string;
  venue?: string;
  venueId?: string;
  status: Status;
  attendees?: number;
  /** Raw API registered count */
  registered?: number;
  capacity?: number;
  category?: string;
  organizer?: string;
  image?: string;
}

export interface Staff {
  id: string;
  PK?: string;
  entity_type?: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole | string;
  department?: string;
  status: Status;
  joinedDate?: string;
  createdAt?: string;
  avatar?: string;
  schedule?: Record<string, unknown>;
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

/** AWS Lambda cursor-based pagination shape returned by all GET list endpoints */
export interface CursorPaginatedResponse<T = any> {
  data: T[];
  nextCursor?: string;
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
  limit?: number;
  cursor?: string;
}

// ============ Multi-Tenant types ============

export interface Reseller {
  id: string;
  /** DynamoDB raw PK e.g. "RESELLER#<uuid>" – present on list/detail responses */
  PK?: string;
  name: string;
  email: string;
  phone?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  /** DynamoDB raw PK e.g. "COMPANY#<uuid>" – present on list/detail responses */
  PK?: string;
  name: string;
  email?: string;
  phone?: string;
  status: Status;
  resellerId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Appointment types ============

export interface Appointment {
  id: string;
  PK?: string;
  entity_type?: string;
  /** ISO date string – required by API on create */
  date?: string;
  guestId?: string;
  guestName?: string;
  staffId?: string;
  staffName?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  venueId?: string;
}

// ============ Calendar types ============

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date string from GET /calendar/events */
  date?: string;
  /** ISO date string – alternative to date */
  start?: string;
  end?: string;
  endDate?: string;
  color?: string;
  type: string;
  status?: string;
  resourceId?: string;
}

export interface CalendarEventsResponse {
  month: string;
  entries: CalendarEvent[];
}

export interface CalendarDayView {
  date: string;
  staffColumns: Array<{
    staff: {
      id: string;
      name: string;
      shortName?: string;
      rooms?: string;
    };
    appointments: Appointment[];
  }>;
}

// ============ Upload types ============

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

// ============ Report / Chart types ============

export interface DailyReport {
  date: string;
  checkIns: number;
  registrations: number;
  revenue?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  extra?: Record<string, unknown>;
}

export interface DashboardActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  actor?: string;
}
