/**
 * Data Management Hooks
 * 
 * React hooks for managing application data with local persistence
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/lib/services';
import { initializeWithSeedData } from '@/lib/storage/indexeddb';
import type { 
  Company,
  Location, 
  Customer,
  Staff,
  Room,
  Service,
  Appointment,
  BaseFilter,
  CustomerFilter,
  StaffFilter,
  AppointmentFilter,
  BookingRequest,
  ApiResponse,
  DataScope
} from '@/types/entities';

// Query Keys
export const queryKeys = {
  companies: ['companies'] as const,
  company: (id: string) => ['companies', id] as const,
  locations: (filter?: BaseFilter) => ['locations', filter] as const,
  location: (id: string) => ['locations', id] as const,
  customers: (filter?: CustomerFilter) => ['customers', filter] as const,
  customer: (id: string) => ['customers', id] as const,
  customerProfile: (id: string) => ['customers', id, 'profile'] as const,
  staff: (filter?: StaffFilter) => ['staff', filter] as const,
  staffMember: (id: string) => ['staff', id] as const,
  rooms: (filter?: BaseFilter) => ['rooms', filter] as const,
  room: (id: string) => ['rooms', id] as const,
  roomsByLocation: (locationId: string) => ['rooms', 'location', locationId] as const,
  services: (filter?: BaseFilter) => ['services', filter] as const,
  service: (id: string) => ['services', id] as const,
  servicesByLocation: (locationId: string) => ['services', 'location', locationId] as const,
  appointments: (filter?: AppointmentFilter) => ['appointments', filter] as const,
  appointment: (id: string) => ['appointments', id] as const,
  todaysAppointments: (locationId: string) => ['appointments', 'today', locationId] as const,
  availableSlots: (locationId: string, serviceId: string, staffId: string, date: string) => 
    ['appointments', 'slots', locationId, serviceId, staffId, date] as const,
  dashboardStats: (scope: DataScope) => ['dashboard', 'stats', scope] as const,
  activityFeed: (scope: DataScope) => ['dashboard', 'activity', scope] as const,
} as const;

// ============================================================================
// INITIALIZATION HOOKS
// ============================================================================

/**
 * Initialize database with seed data
 */
export function useInitializeData() {
  return useMutation({
    mutationFn: initializeWithSeedData,
    onSuccess: () => {
      console.log('Database initialized successfully');
    },
  });
}

// ============================================================================
// COMPANY HOOKS
// ============================================================================

export function useCompanies(filter?: BaseFilter) {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: () => services.company.getCompanies(filter),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: queryKeys.company(id),
    queryFn: () => services.company.getCompanyById(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.company.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      services.company.updateCompany(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: queryKeys.company(id) });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.company.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
}

// ============================================================================
// LOCATION HOOKS
// ============================================================================

export function useLocations(filter?: BaseFilter) {
  return useQuery({
    queryKey: queryKeys.locations(filter),
    queryFn: () => services.location.getLocations(filter),
  });
}

export function useLocationsByCompany(companyId: string) {
  return useQuery({
    queryKey: queryKeys.locations({ search: companyId }),
    queryFn: () => services.location.getLocationsByCompanyId(companyId),
    enabled: !!companyId,
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: queryKeys.location(id),
    queryFn: () => services.location.getLocationById(id),
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.location.createLocation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.company(variables.companyId) });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Location> }) =>
      services.location.updateLocation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.location(id) });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.location.deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
}

// ============================================================================
// CUSTOMER HOOKS
// ============================================================================

export function useCustomers(filter?: CustomerFilter) {
  return useQuery({
    queryKey: queryKeys.customers(filter),
    queryFn: () => services.customer.getCustomers(filter),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => services.customer.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCustomerProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.customerProfile(id),
    queryFn: () => services.customer.getCustomerProfile(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.customer.createCustomer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.location(variables.locationId) });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      services.customer.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customerProfile(id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.customer.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
    },
  });
}

// ============================================================================
// STAFF HOOKS
// ============================================================================

export function useStaff(filter?: StaffFilter) {
  return useQuery({
    queryKey: queryKeys.staff(filter),
    queryFn: () => services.staff.getStaff(filter),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: queryKeys.staffMember(id),
    queryFn: () => services.staff.getStaffById(id),
    enabled: !!id,
  });
}

export function useStaffByLocation(locationId: string) {
  return useQuery({
    queryKey: queryKeys.staff({ locationId }),
    queryFn: () => services.staff.getStaffByLocation(locationId),
    enabled: !!locationId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.staff.createStaff,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      queryClient.invalidateQueries({ queryKey: queryKeys.location(variables.locationId) });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Staff> }) =>
      services.staff.updateStaff(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      queryClient.invalidateQueries({ queryKey: queryKeys.staffMember(id) });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.staff.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      queryClient.invalidateQueries({ queryKey: queryKeys.locations() });
    },
  });
}

// ============================================================================
// ROOM HOOKS
// ============================================================================

export function useRooms(filter?: BaseFilter) {
  return useQuery({
    queryKey: queryKeys.rooms(filter),
    queryFn: () => services.room.getRooms(filter),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: queryKeys.room(id),
    queryFn: () => services.room.getRoomById(id),
    enabled: !!id,
  });
}

export function useRoomsByLocation(locationId: string) {
  return useQuery({
    queryKey: queryKeys.roomsByLocation(locationId),
    queryFn: () => services.room.getRoomsByLocation(locationId),
    enabled: !!locationId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.room.createRoom,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roomsByLocation(variables.locationId) });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) =>
      services.room.updateRoom(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: queryKeys.room(id) });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.room.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
    },
  });
}

// ============================================================================
// SERVICE HOOKS
// ============================================================================

export function useServices(filter?: BaseFilter) {
  return useQuery({
    queryKey: queryKeys.services(filter),
    queryFn: () => services.service.getServices(filter),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.service(id),
    queryFn: () => services.service.getServiceById(id),
    enabled: !!id,
  });
}

export function useServicesByLocation(locationId: string) {
  return useQuery({
    queryKey: queryKeys.servicesByLocation(locationId),
    queryFn: () => services.service.getServicesByLocation(locationId),
    enabled: !!locationId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.service.createService,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services() });
      queryClient.invalidateQueries({ queryKey: queryKeys.servicesByLocation(variables.locationId) });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      services.service.updateService(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services() });
      queryClient.invalidateQueries({ queryKey: queryKeys.service(id) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.service.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services() });
    },
  });
}

// ============================================================================
// APPOINTMENT HOOKS
// ============================================================================

export function useAppointments(filter?: AppointmentFilter) {
  return useQuery({
    queryKey: queryKeys.appointments(filter),
    queryFn: () => services.appointment.getAppointments(filter),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => services.appointment.getAppointmentById(id),
    enabled: !!id,
  });
}

export function useTodaysAppointments(locationId: string) {
  return useQuery({
    queryKey: queryKeys.todaysAppointments(locationId),
    queryFn: () => services.appointment.getTodaysAppointments(locationId),
    enabled: !!locationId,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useAvailableSlots(
  locationId: string,
  serviceId: string,
  staffId: string,
  date: string
) {
  return useQuery({
    queryKey: queryKeys.availableSlots(locationId, serviceId, staffId, date),
    queryFn: () => services.appointment.getAvailableSlots(locationId, serviceId, staffId, date),
    enabled: !!(locationId && serviceId && staffId && date),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: services.appointment.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'slots'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      services.appointment.updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointment(id) });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
    },
  });
}

export function useAppointmentActions() {
  const queryClient = useQueryClient();

  const invalidateAppointmentData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments() });
    queryClient.invalidateQueries({ queryKey: ['appointments', 'today'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    checkIn: useMutation({
      mutationFn: services.appointment.checkInAppointment,
      onSuccess: invalidateAppointmentData,
    }),
    complete: useMutation({
      mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
        services.appointment.completeAppointment(id, notes),
      onSuccess: invalidateAppointmentData,
    }),
    cancel: useMutation({
      mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
        services.appointment.cancelAppointment(id, reason, notes),
      onSuccess: invalidateAppointmentData,
    }),
    markNoShow: useMutation({
      mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
        services.appointment.markNoShow(id, notes),
      onSuccess: invalidateAppointmentData,
    }),
    restore: useMutation({
      mutationFn: services.appointment.restoreAppointment,
      onSuccess: invalidateAppointmentData,
    }),
  };
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export function useDashboardStats(scope: DataScope) {
  return useQuery({
    queryKey: queryKeys.dashboardStats(scope),
    queryFn: () => services.dashboard.getDashboardStats(scope),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useActivityFeed(scope: DataScope, limit = 20) {
  return useQuery({
    queryKey: queryKeys.activityFeed(scope),
    queryFn: () => services.dashboard.getActivityFeed(scope, limit),
    refetchInterval: 60000, // Refetch every minute
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to validate booking before submission
 */
export function useBookingValidation() {
  return useMutation({
    mutationFn: (booking: any) => services.appointment.validateBooking(booking),
  });
}

/**
 * Search hook for customers
 */
export function useSearchCustomers() {
  return useMutation({
    mutationFn: ({ locationId, query }: { locationId: string; query: string }) =>
      services.customer.searchCustomers(locationId, query),
  });
}

/**
 * Search hook for staff
 */
export function useSearchStaff() {
  return useMutation({
    mutationFn: ({ locationId, query }: { locationId: string; query: string }) =>
      services.staff.searchStaff(locationId, query),
  });
}