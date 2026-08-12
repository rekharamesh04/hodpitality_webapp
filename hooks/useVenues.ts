import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { venueService } from "@/services/venue.service";
import { QUERY_KEYS } from "@/constants";
import type { TableFilters, Venue } from "@/types";

export function useVenues(filters: TableFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.VENUES, "list", filters],
    queryFn:  () => venueService.getVenues(filters),
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.VENUE_DETAIL(id),
    queryFn:  () => venueService.getVenue(id),
    enabled:  !!id,
  });
}

export function useCreateVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Venue>) => venueService.createVenue(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VENUES });
      toast.success("Venue created");
    },
    onError: () => toast.error("Failed to create venue"),
  });
}

export function useUpdateVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Venue> }) =>
      venueService.updateVenue(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VENUES });
      toast.success("Venue updated");
    },
    onError: () => toast.error("Failed to update venue"),
  });
}

export function useDeleteVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueService.deleteVenue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VENUES });
      toast.success("Venue deleted");
    },
    onError: () => toast.error("Failed to delete venue"),
  });
}

export function useUpdateVenueOccupancy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentOccupancy }: { id: string; currentOccupancy: number }) =>
      venueService.updateOccupancy(id, currentOccupancy),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VENUES }),
    onError: () => toast.error("Failed to update occupancy"),
  });
}
