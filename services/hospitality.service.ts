import { sleep } from "@/utils/helpers";
import { mockHospitality as MOCK_HOSPITALITY } from "@/constants/mock-data";
import type { Hospitality as HospitalityBooking, PaginatedResponse, TableFilters } from "@/types";

let bookingData: any[] = [...MOCK_HOSPITALITY];

export const hospitalityService = {
  async getBookings(filters: TableFilters = {}): Promise<PaginatedResponse<HospitalityBooking>> {
    await sleep(450);
    let data = [...bookingData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.type.toLowerCase().includes(q) ||
          b.hotel?.toLowerCase().includes(q)
      );
    }
    if (filters.status) data = data.filter((b) => b.status === filters.status);
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    const total = data.length;
    return {
      data: data.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async createBooking(input: Partial<HospitalityBooking> & Record<string, any>): Promise<HospitalityBooking> {
    await sleep(600);
    const b: any = {
      id: `hb${Date.now()}`,
      guestId: input.guestId ?? "",
      guestName: input.guestName ?? "",
      type: input.type ?? "hotel",
      status: "pending",
      scheduledAt: input.scheduledAt ?? new Date().toISOString(),
      details: input.details,
      hotel: input.hotel,
      room: input.room,
      flightNumber: input.flightNumber,
      specialRequests: input.specialRequests,
      isVip: input.isVip ?? false,
      createdAt: new Date().toISOString(),
    };
    bookingData = [b, ...bookingData];
    return b;
  },

  async updateBookingStatus(id: string, status: HospitalityBooking["status"]): Promise<HospitalityBooking> {
    await sleep(400);
    const idx = bookingData.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Booking not found");
    bookingData[idx] = { ...bookingData[idx], status };
    return bookingData[idx];
  },

  async getVipGuests(): Promise<HospitalityBooking[]> {
    await sleep(300);
    return bookingData.filter((b) => b.isVip);
  },
};
