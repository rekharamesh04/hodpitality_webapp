import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { eventService } from "@/services/event.service";
import { QUERY_KEYS } from "@/constants";
import type { Event, TableFilters } from "@/types";
type FilterOptions = TableFilters;

export const eventKeys = {
  all:       QUERY_KEYS.EVENTS,
  list:      (filters: FilterOptions) => [...QUERY_KEYS.EVENTS, "list", filters] as const,
  detail:    (id: string) => QUERY_KEYS.EVENT_DETAIL(id),
  attendees: (id: string) => QUERY_KEYS.EVENT_ATTENDEES(id),
  upcoming:  QUERY_KEYS.UPCOMING_EVENTS,
};

export function useEvents(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn:  () => eventService.getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn:  () => eventService.getEvent(id),
    enabled:  !!id,
  });
}

export function useEventAttendees(id: string) {
  return useQuery({
    queryKey: eventKeys.attendees(id),
    queryFn:  () => eventService.getEventAttendees(id),
    enabled:  !!id,
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: eventKeys.upcoming,
    queryFn:  () => eventService.getUpcomingEvents(),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Event>) => eventService.createEvent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Event created");
    },
    onError: () => toast.error("Failed to create event"),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventService.updateEvent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Event updated");
    },
    onError: () => toast.error("Failed to update event"),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Event deleted");
    },
    onError: () => toast.error("Failed to delete event"),
  });
}
