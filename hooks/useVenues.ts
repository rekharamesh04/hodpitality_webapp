import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { popup } from '@/lib/popup';
import { venueService } from "@/services/venue.service";
import type { VenueFilters, CreateVenuePayload, UpdateVenuePayload } from "@/services/venue.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const venueKeys = {
  all:    QUERY_KEYS.VENUES,
  list:   (filters: VenueFilters) => [...QUERY_KEYS.VENUES, "list", filters] as const,
  detail: (id: string) => QUERY_KEYS.VENUE_DETAIL(id),
};

export function useVenues(filters: VenueFilters = {}) {
  return useQuery({
    queryKey: venueKeys.list(filters),
    queryFn:  () => venueService.getVenues(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: venueKeys.detail(id),
    queryFn:  () => venueService.getVenue(id),
    enabled:  !!id,
  });
}

export function useCreateVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVenuePayload) => venueService.createVenue(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: venueKeys.all });
      popup.success("Venue created");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create venue")),
  });
}

export function useUpdateVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVenuePayload }) =>
      venueService.updateVenue(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: venueKeys.all });
      qc.invalidateQueries({ queryKey: venueKeys.detail(vars.id) });
      popup.success("Venue updated");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update venue")),
  });
}

export function useDeleteVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueService.deleteVenue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: venueKeys.all });
      popup.success("Venue deleted");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return popup.error(err?.backendMessage ?? "This venue can't be deleted while it has upcoming events or bookings.");
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete venue"));
    },
  });
}

export function useUpdateVenueOccupancy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, occupancy }: { id: string; occupancy: number }) =>
      venueService.updateOccupancy(id, occupancy),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: venueKeys.all });
      qc.invalidateQueries({ queryKey: venueKeys.detail(vars.id) });
      popup.success("Occupancy updated");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update occupancy")),
  });
}
