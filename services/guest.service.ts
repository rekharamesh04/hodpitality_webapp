import { sleep, filterBySearch } from "@/utils/helpers";
import { mockGuests as MOCK_GUESTS } from "@/constants/mock-data";
import type { Guest, PaginatedResponse, TableFilters } from "@/types";

let guestData = [...MOCK_GUESTS];

export const guestService = {
  async getGuests(filters: TableFilters = {}): Promise<PaginatedResponse<Guest>> {
    await sleep(500);
    let data = [...guestData];

    if (filters.search) {
      data = filterBySearch(data as unknown as Record<string, unknown>[], filters.search, [
        "name", "email", "phone", "company", "registrationNumber",
      ]) as unknown as Guest[];
    }
    if (filters.status) {
      data = data.filter((g) => g.status === filters.status);
    }
    if ((filters as any).eventId) {
      data = data.filter((g) => (g as any).eventId === (filters as any).eventId);
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    const total = data.length;
    const start = (page - 1) * pageSize;

    return {
      data: data.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getGuest(id: string): Promise<Guest> {
    await sleep(300);
    const guest = guestData.find((g) => g.id === id);
    if (!guest) throw new Error("Guest not found");
    return guest;
  },

  async createGuest(input: Partial<Guest> & Record<string, any>): Promise<Guest> {
    await sleep(600);
    const newGuest: any = {
      id: `g${Date.now()}`,
      email: input.email ?? "",
      phone: input.phone ?? "",
      company: input.company,
      country: input.country ?? "",
      countryCode: "XX",
      status: "pending",
      tags: input.tags ?? [],
      registrationNumber: `REG-2026-${String(guestData.length + 1).padStart(4, "0")}`,
      room: input.room,
      eventId: input.eventId,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    guestData = [newGuest, ...guestData];
    return newGuest;
  },

  async updateGuest(id: string, input: Partial<Guest>): Promise<Guest> {
    await sleep(500);
    const idx = guestData.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error("Guest not found");
    guestData[idx] = { ...guestData[idx], ...input } as any;
    return guestData[idx];
  },

  async deleteGuest(id: string): Promise<void> {
    await sleep(400);
    guestData = guestData.filter((g) => g.id !== id);
  },

  async bulkDeleteGuests(ids: string[]): Promise<void> {
    await sleep(600);
    guestData = guestData.filter((g) => !ids.includes(g.id));
  },

  async exportGuests(filters: TableFilters = {}): Promise<Guest[]> {
    const result = await guestService.getGuests({ ...filters, pageSize: 1000 });
    return result.data;
  },
};
