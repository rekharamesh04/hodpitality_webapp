import { sleep } from "@/utils/helpers";
import { mockCheckIns as MOCK_CHECKINS } from "@/constants/mock-data";
import type { CheckIn, PaginatedResponse, TableFilters } from "@/types";

let checkInData: any[] = [...MOCK_CHECKINS];

export const checkInService = {
  async getCheckIns(filters: TableFilters = {}): Promise<PaginatedResponse<CheckIn>> {
    await sleep(400);
    let data = [...checkInData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (c) =>
          c.guestName.toLowerCase().includes(q) ||
          c.guestEmail.toLowerCase().includes(q) ||
          c.eventName?.toLowerCase().includes(q)
      );
    }
    if (filters.status) data = data.filter((c) => c.status === filters.status);
    if ((filters as any).eventId) data = data.filter((c) => c.eventId === (filters as any).eventId);

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

  async checkIn(guestId: string, method: string = "manual"): Promise<any> {
    await sleep(700);
    // Duplicate check
    const existing = checkInData.find(
      (c) => c.guestId === guestId && c.status === "success"
    );
    if (existing) {
      const duplicate: any = {
        id: `ci${Date.now()}`,
        guestId,
        guestName: existing.guestName,
        guestEmail: existing.guestEmail,
        eventId: existing.eventId,
        eventName: existing.eventName,
        method,
        status: "duplicate",
        timestamp: new Date().toISOString(),
        operator: "Current User",
        badgePrinted: false,
      };
      checkInData = [duplicate, ...checkInData];
      return duplicate;
    }
    const newCheckIn: any = {
      id: `ci${Date.now()}`,
      guestId,
      guestName: "Guest",
      guestEmail: "",
      method,
      status: "success",
      timestamp: new Date().toISOString(),
      operator: "Current User",
      badgePrinted: false,
    };
    checkInData = [newCheckIn, ...checkInData];
    return newCheckIn;
  },

  async printBadge(checkInId: string): Promise<void> {
    await sleep(1200);
    const idx = checkInData.findIndex((c) => c.id === checkInId);
    if (idx !== -1) checkInData[idx].badgePrinted = true;
  },

  async getStats(): Promise<{
    total: number;
    success: number;
    duplicate: number;
    failed: number;
  }> {
    await sleep(300);
    return {
      total:     checkInData.length,
      success:   checkInData.filter((c) => c.status === "success").length,
      duplicate: checkInData.filter((c) => c.status === "duplicate").length,
      failed:    checkInData.filter((c) => c.status === "failed").length,
    };
  },
};
