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
  /** API may not return name (Cognito doesn't always populate it) */
  name?: string;
  email: string;
  role: UserRole;
  tenant_id?: string;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  /** Cognito Access Token — required for PUT /settings/password */
  accessToken?: string;
  refreshToken?: string;
  /** Present on first-time login: must complete challenge before getting a token */
  ChallengeName?: string;
  Session?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
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
  /** Present on records created via facial recognition (confirmed in the backend's own check-in creation payload); not guaranteed on every check-in method. */
  status?: string;
}

export interface CheckInStats {
  expected: number;
  arrived: number;
  onSite: number;
  completed: number;
  noShows: number;
  cancelled: number;
}

// ============ Payment types ============
// Backed by the /payments API added in the Payments & Billing patch — manual payment
// recording only (no gateway integrated). See hodpitality_backend_patch/payments_patch.py.

export type PaymentStatus =
  | 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

export type PaymentMethodType = 'cash' | 'card' | 'credit_card' | 'upi' | 'bank_transfer' | 'online' | 'other';

export interface Payment {
  id: string;
  PK?: string;
  entity_type?: string;
  registrationId?: string;
  customerId?: string;
  guestId?: string;
  /** Denormalized display fields populated client-side when available. */
  customerName?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  method?: string;
  provider?: string;
  transactionId?: string;
  description?: string;
  paidAt?: string;
  recordedBy?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

export interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalAmount: number;
  refundedAmount: number;
  netAmount: number;
}

export interface Registration {
  id: string;
  guestId?: string;
  eventId?: string;
  guestName: string;
  guestEmail: string;
  phone: string;
  event: string;
  registrationDate?: string;
  status: Status;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  amount?: number;
  category: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Hospitality {
  id: string;
  guestId: string;
  guestName: string;
  type: 'Hotel' | 'Transport' | 'Meal' | 'Airport Pickup' | 'Special Request';
  description: string;
  details?: string;
  status: Status;
  bookingDate: string;
  serviceDate: string;
  scheduledAt?: string;
  venue?: string;
  vendor?: string;
  notes?: string;
  cost?: number;
  createdAt?: string;
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
  /** Cognito tenant scope — required when a Reseller invites a company_admin */
  tenant_id?: string;
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

export type ActivityType = 'check_in' | 'registration' | 'hospitality' | 'event' | 'system';

/** Normalised shape the UI renders — produced by reportService.getActivityFeed() from whatever the API actually returns. */
export interface ActivityFeedItem {
  id: string;
  type: ActivityType | (string & {});
  title: string;
  description?: string;
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

/** AWS Lambda paginated response shape returned by GET /guests and GET /customers */
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  nextCursor?: string | null;
}

/** Alias kept for backwards compatibility – prefer PaginatedResponse for guests/customers */
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
  entity_type?: string;
  name: string;
  /** Optional at the backend — POST /resellers only requires `name` */
  email?: string;
  phone?: string;
  /** Not part of the confirmed POST /resellers response fields — render defensively */
  status?: Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  /** DynamoDB raw PK e.g. "COMPANY#<uuid>" – present on list/detail responses */
  PK?: string;
  entity_type?: string;
  name: string;
  /** Optional at the backend — POST /companies only requires `name` */
  email?: string;
  phone?: string;
  /** Not part of the confirmed POST /companies response fields — render defensively */
  status?: Status;
  /** Owning reseller — backend field name, snake_case on the wire like `tenant_id` */
  reseller_id?: string;
  /** Backend-generated (`tenant-{company_id}`) — never sent as an editable field */
  tenant_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ Appointment types ============

export interface Appointment {
  id: string;
  PK?: string;
  entity_type?: string;
  /** ISO date string – required by API on create */
  date?: string;
  /** Required by API on create — the backend also accepts guestId as an alias */
  customerId?: string;
  guestId?: string;
  guestName?: string;
  customerName?: string;
  /** Enrichment the day-calendar endpoint adds when it can resolve the customer record */
  customerTier?: string;
  allergyNotes?: string;
  /** Required by API on create */
  staffId?: string;
  staffName?: string;
  title?: string;
  /** Required by API on create (HH:mm) */
  startTime?: string;
  endTime?: string;
  /** Service name/id — defaults server-side if omitted. The backend also accepts serviceId/serviceName as aliases. */
  service?: string;
  serviceId?: string;
  serviceName?: string;
  /** Minutes — defaults to 30 server-side if omitted */
  duration?: number;
  room?: string;
  status?: 'scheduled' | 'confirmed' | 'pending' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'no_show';
  notes?: string;
  venueId?: string;
  createdAt?: string;
  /** Set by the backend automatically when a matching check-in arrives — never write these from the frontend */
  arrivedAt?: string;
  checkinId?: string;
  /** Set by the backend automatically when status becomes "completed" — never write this from the frontend */
  checkoutAt?: string;
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
  /** Present on type: "appointment" entries */
  startTime?: string;
  duration?: number;
  staffId?: string;
  customerId?: string;
  /** Present on type: "event" entries */
  venue?: string;
  category?: string;
  attendees?: number;
  capacity?: number;
}

/** Alias matching the backend's terminology for a single GET /calendar/events row. */
export type CalendarEntry = CalendarEvent;

export interface CalendarEventsResponse {
  month: string;
  entries: CalendarEvent[];
  totalAppointments?: number;
  totalEvents?: number;
}

export interface CalendarDayView {
  date: string;
  staffColumns: Array<{
    staff: {
      id: string;
      name: string;
      shortName?: string;
      rooms?: string;
      department?: string;
      role?: string;
    };
    appointments: Appointment[];
  }>;
  totalAppointments?: number;
  /** Flat list of the same appointments shown in staffColumns — some backends include both shapes */
  appointments?: Appointment[];
  onSite?: number;
}

// ============ Upload types ============

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  objectKey: string;
}

// ============ Report / Chart types ============

export interface DailyReport {
  date: string;
  count?: number;
  checkIns?: number;
  registrations?: number;
  revenue?: number;
  appointments?: number;
}

export interface DailyBookingReport {
  date: string;
  count: number;
  [key: string]: unknown;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  [key: string]: unknown;
}

export interface GuestArrivalPoint {
  hour: string;
  arrivals: number;
  [key: string]: unknown;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  extra?: Record<string, unknown>;
}

/**
 * Raw shape returned by GET /dashboard/activity — field names aren't fully
 * confirmed against the backend (it may send `message` or `title`/`description`,
 * `actor` or `user`, etc.), so nothing is guaranteed present.
 * reportService.getActivityFeed() normalizes this into ActivityFeedItem.
 */
export interface DashboardActivityItem {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  description?: string;
  timestamp?: string;
  createdAt?: string;
  date?: string;
  user?: string;
  actor?: string;
  icon?: string;
}
