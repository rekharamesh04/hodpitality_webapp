import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { eventService } from "@/services/event.service";
import type { EventFilters, CreateEventPayload, UpdateEventPayload } from "@/services/event.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const eventKeys = {
  all:       QUERY_KEYS.EVENTS,
  list:      (filters: EventFilters) => [...QUERY_KEYS.EVENTS, "list", filters] as const,
  detail:    (id: string) => QUERY_KEYS.EVENT_DETAIL(id),
  attendees: (id: string) => QUERY_KEYS.EVENT_ATTENDEES(id),
  upcoming:  QUERY_KEYS.UPCOMING_EVENTS,
};

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn:  () => eventService.getEvents(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn:  () => eventService.getEvent(id),
    enabled:  !!id,
  });
}

/** The actual Guest/Check-in relationship data source for an event — see services/event.service.ts. */
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
    mutationFn: (input: CreateEventPayload) => eventService.createEvent(input),
    onSuccess: () => {
      // eventKeys.all is ['events'], a prefix of eventKeys.upcoming (['events','upcoming']),
      // so this also covers the Dashboard's upcoming-events query — no separate invalidation needed.
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Event created");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create event")),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) =>
      eventService.updateEvent(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: eventKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Event updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update event")),
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
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "This event can't be deleted — it may have existing registrations or check-ins.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete event"));
    },
  });
}
