import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { eventService } from "@/services/event.service";
import type { TableFilters, Event } from "@/types";
type FilterOptions = TableFilters;

export const eventKeys = {
  all: ["events"] as const,
  list: (filters: FilterOptions) => ["events", "list", filters] as const,
  detail: (id: string) => ["events", id] as const,
  upcoming: ["events", "upcoming"] as const,
};

export function useEvents(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventService.getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEvent(id),
    enabled: !!id,
  });
}

export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: [...eventKeys.upcoming, limit],
    queryFn: () => eventService.getUpcomingEvents(limit),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Event>) => eventService.createEvent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
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
      toast.success("Event updated");
    },
    onError: () => toast.error("Failed to update event"),
  });
}
