// Lightweight hooks (no TanStack Query dependency)
export { useTerminology, useIndustry, type Terminology } from './useTerminology';
export { useSyncIdentity } from './useSyncIdentity';
export { useIndustries } from './useIndustries';
export { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteAllNotifications } from './use-notifications';

// TanStack Query hooks
export * from './useCheckins';
export * from './useEvents';
export * from './useGuests';
export * from './useHospitality';
export * from './useReports';
export * from './useVenues';
export * from './useStaff';
export * from './useAppointments';
export * from './useCalendar';
export * from './useSettings';
export * from './useResellers';
export * from './useCompanies';
