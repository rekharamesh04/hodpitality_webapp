/**
 * Core Entity Types for Hospitality Management System
 * 
 * This system is a multi-tenant, multi-location membership/service operations application
 * NOT a traditional hotel PMS - it manages appointments, services, and customer relationships
 */

// ============================================================================
// ENUMS & STATUS TYPES
// ============================================================================

export type EntityStatus = 'active' | 'inactive' | 'archived';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'checked-in' 
  | 'completed' 
  | 'cancelled' 
  | 'no-show';

export type CancellationReason =
  | 'customer-requested'
  | 'staff-unavailable'
  | 'location-closure'
  | 'no-show'
  | 'other';

export type MembershipTier = 
  | 'basic'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'vip';

export type CommunicationChannel = 
  | 'email'
  | 'phone'
  | 'sms'
  | 'app';

export type UserRole = 
  | 'reseller-admin'  // Can see all companies and locations
  | 'company-admin'   // Can see own company and its locations
  | 'location-staff'  // Can see only own location
  | 'viewer';         // Read-only access

export type CompanyPlan = 
  | 'starter'
  | 'professional'
  | 'enterprise'
  | 'custom';

export type RoomType = 
  | 'treatment-room'
  | 'consultation-room'
  | 'private-room'
  | 'shared-space'
  | 'other';

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Company - Top level entity in the hierarchy
 * Reseller Admin manages multiple companies
 */
export interface Company {
  id: string;
  name: string;
  plan: CompanyPlan;
  description?: string;
  status: EntityStatus;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  locationIds: string[];  // Derived/cached for performance
  createdAt: string;
  updatedAt: string;
}

/**
 * Location - Belongs to a Company
 * Physical location where services are provided
 */
export interface Location {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager?: string;
  status: EntityStatus;
  customerCount?: number;  // Derived/cached
  staffCount?: number;     // Derived/cached
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer - Member who books appointments
 * Belongs to a specific location
 */
export interface Customer {
  id: string;
  locationId: string;
  companyId: string;  // Denormalized for easier querying
  
  // Basic Info
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Membership
  membershipTier: MembershipTier;
  memberSince: string;
  
  // Preferences
  preferredTime?: string;  // e.g., "morning", "afternoon", "evening"
  communicationChannel: CommunicationChannel;
  
  // Statistics (derived but cached for performance)
  visits: number;
  lastVisit?: string;
  balance?: number;  // Account balance if applicable
  
  // Flags & Notes
  flags?: string[];  // e.g., ["vip", "needs-special-attention"]
  notes?: string;
  summary?: string;
  
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Staff - Employee who provides services
 * Belongs to a location
 */
export interface Staff {
  id: string;
  locationId: string;
  companyId: string;  // Denormalized
  
  name: string;
  email: string;
  phone: string;
  role: string;  // Job role like "therapist", "consultant", "stylist"
  
  // Work details
  roomAssignments?: string[];  // Room IDs they're assigned to
  specializations?: string[];
  availability?: WeeklySchedule;
  
  status: EntityStatus;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Room - Physical space where services are provided
 * Belongs to a location
 */
export interface Room {
  id: string;
  locationId: string;
  companyId: string;  // Denormalized
  
  name: string;
  type: RoomType;
  capacity?: number;
  floor?: string;
  
  description?: string;
  amenities?: string[];
  
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service - Type of service offered
 * Belongs to a location
 * Determines appointment duration and room requirements
 */
export interface Service {
  id: string;
  locationId: string;
  companyId: string;  // Denormalized
  
  name: string;
  description?: string;
  duration: number;  // Duration in minutes
  
  roomId?: string;  // Preferred/default room for this service
  price?: number;
  
  category?: string;
  requirements?: string[];
  
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Appointment - Core business entity
 * Represents a booked service appointment
 */
export interface Appointment {
  id: string;
  locationId: string;
  companyId: string;  // Denormalized
  
  // Related entities
  customerId: string;
  staffId: string;
  serviceId: string;
  roomId: string;
  
  // Scheduling
  date: string;  // ISO date string (just the date part)
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  duration: number;   // Duration in minutes
  
  // Status & workflow
  status: AppointmentStatus;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  
  // Cancellation
  cancellationReason?: CancellationReason;
  cancellationNotes?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  completedAt?: string;
  
  // Metadata
  createdBy?: string;
  confirmedAt?: string;
  reminderSent?: boolean;
}

/**
 * Weekly schedule for staff availability
 */
export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  available: boolean;
  slots?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;  // "09:00"
  endTime: string;    // "17:00"
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  
  // Scope based on role
  companyId?: string;   // For company-admin and location-staff
  locationId?: string;  // For location-staff only
  
  avatar?: string;
  phone?: string;
  status: EntityStatus;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DERIVED/VIEW TYPES
// ============================================================================

/**
 * Customer profile with aggregated data
 */
export interface CustomerProfile extends Customer {
  // Upcoming appointments
  upcomingAppointments: Appointment[];
  
  // Historical appointments
  appointmentHistory: Appointment[];
  
  // Statistics
  totalSpent?: number;
  averageRating?: number;
  preferredServices?: string[];
  preferredStaff?: string[];
}

/**
 * Appointment with populated relations
 */
export interface AppointmentWithRelations extends Appointment {
  customer: Customer;
  staff: Staff;
  service: Service;
  room: Room;
  location: Location;
}

/**
 * Available time slot for booking
 */
export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  staffId: string;
  roomId: string;
  available: boolean;
  reason?: string;  // Why not available
}

/**
 * Booking request data
 */
export interface BookingRequest {
  customerId: string;
  serviceId: string;
  staffId: string;
  roomId: string;
  date: string;
  startTime: string;
  notes?: string;
}

/**
 * Booking validation result
 */
export interface BookingValidation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============================================================================
// APPOINTMENT STATUS TRANSITIONS
// ============================================================================

/**
 * Valid status transitions for appointment workflow
 */
export const VALID_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  'scheduled': ['checked-in', 'cancelled', 'no-show'],
  'checked-in': ['completed', 'cancelled'],
  'completed': [],  // Terminal state
  'cancelled': ['scheduled'],  // Can be restored
  'no-show': ['scheduled'],    // Can be restored
};

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================================
// DATA SCOPING TYPES
// ============================================================================

/**
 * Data scope based on user role
 */
export interface DataScope {
  role: UserRole;
  companyIds?: string[];
  locationIds?: string[];
}

/**
 * Get data scope for a user
 */
export function getUserScope(user: User): DataScope {
  switch (user.role) {
    case 'reseller-admin':
      return { role: user.role };  // Can see everything
    
    case 'company-admin':
      return {
        role: user.role,
        companyIds: user.companyId ? [user.companyId] : [],
      };
    
    case 'location-staff':
    case 'viewer':
      return {
        role: user.role,
        companyIds: user.companyId ? [user.companyId] : [],
        locationIds: user.locationId ? [user.locationId] : [],
      };
    
    default:
      return { role: user.role, companyIds: [], locationIds: [] };
  }
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface BaseFilter {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerFilter extends BaseFilter {
  locationId?: string;
  membershipTier?: MembershipTier;
  dateFrom?: string;
  dateTo?: string;
}

export interface AppointmentFilter extends BaseFilter {
  locationId?: string;
  customerId?: string;
  staffId?: string;
  serviceId?: string;
  roomId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AppointmentStatus;
}

export interface StaffFilter extends BaseFilter {
  locationId?: string;
  role?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

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

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// DASHBOARD/ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  // Today's metrics
  todayAppointments: number;
  todayCheckedIn: number;
  todayCompleted: number;
  todayScheduled: number;
  todayNoShows: number;
  todayCancelled: number;
  
  // Overall metrics (scope-dependent)
  totalCustomers: number;
  totalStaff: number;
  totalLocations: number;
  totalCompanies: number;
  
  // Period metrics
  thisWeekAppointments: number;
  thisMonthAppointments: number;
  thisMonthRevenue?: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'appointment' | 'customer' | 'check-in' | 'cancellation' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type {
  // Core entities are already exported via interface
};
