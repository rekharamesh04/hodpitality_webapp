import { sleep } from "@/utils/helpers";
import { mockEvents as MOCK_EVENTS } from "@/constants/mock-data";
import type { Event, PaginatedResponse, TableFilters } from "@/types";

let eventData = [...MOCK_EVENTS];

export const eventService = {
  async getEvents(filters: TableFilters = {}): Promise<PaginatedResponse<Event>> {
    await sleep(400);
    let data = [...eventData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    if (filters.status) data = data.filter((e) => e.status === filters.status);
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

  async getEvent(id: string): Promise<Event> {
    await sleep(300);
    const ev = eventData.find((e) => e.id === id);
    if (!ev) throw new Error("Event not found");
    return ev;
  },

  async getUpcomingEvents(limit = 5): Promise<Event[]> {
    await sleep(300);
    return eventData
      .filter((e) => (e.status as string) === "upcoming" || e.status === "active")
      .slice(0, limit);
  },

  async createEvent(input: Partial<Event>): Promise<Event> {
    await sleep(700);
    const ev: Event = {
      id: `ev${Date.now()}`,
      title: (input as any).name ?? input.title ?? "New Event",
      description: input.description ?? "",
      startDate: input.startDate ?? new Date().toISOString(),
      endDate: input.endDate ?? new Date().toISOString(),
      venue: "TBD",
      venueId: input.venueId ?? "",
      capacity: input.capacity ?? 100,
      attendees: 0,
      status: "active",
      category: input.category ?? "General",
      organizer: input.organizer ?? "Admin",
      createdAt: new Date().toISOString(),
    } as Event;
    eventData = [ev, ...eventData];
    return ev;
  },

  async updateEvent(id: string, input: Partial<Event>): Promise<Event> {
    await sleep(500);
    const idx = eventData.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Event not found");
    eventData[idx] = { ...eventData[idx], ...input };
    return eventData[idx];
  },

  async deleteEvent(id: string): Promise<void> {
    await sleep(400);
    eventData = eventData.filter((e) => e.id !== id);
  },
};
