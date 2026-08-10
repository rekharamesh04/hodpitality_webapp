// Status type aliases for legacy service compatibility
type GuestStatus = string;
type EventStatus = string;
type VenueStatus = string;
type BookingStatus = string;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getGuestStatusColor(status: GuestStatus): string {
  const map: Record<GuestStatus, string> = {
    "checked-in":  "bg-success/10 text-success border-success/20",
    "checked-out": "bg-muted text-muted-foreground border-border",
    "pending":     "bg-warning/10 text-warning border-warning/20",
    "cancelled":   "bg-destructive/10 text-destructive border-destructive/20",
    "no-show":     "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function getEventStatusColor(status: EventStatus): string {
  const map: Record<EventStatus, string> = {
    upcoming:  "bg-info/10 text-info border-info/20",
    active:    "bg-success/10 text-success border-success/20",
    completed: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function getVenueStatusColor(status: VenueStatus): string {
  const map: Record<VenueStatus, string> = {
    available:   "bg-success/10 text-success border-success/20",
    occupied:    "bg-warning/10 text-warning border-warning/20",
    maintenance: "bg-destructive/10 text-destructive border-destructive/20",
    reserved:    "bg-info/10 text-info border-info/20",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function getBookingStatusColor(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    confirmed: "bg-success/10 text-success border-success/20",
    pending:   "bg-warning/10 text-warning border-warning/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-muted text-muted-foreground border-border",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function filterBySearch<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? "").toLowerCase().includes(q))
  );
}

export function sortArray<T>(
  arr: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    const cmp = av! < bv! ? -1 : 1;
    return order === "asc" ? cmp : -cmp;
  });
}

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "").replace(/"/g, '""');
          return val.includes(",") || val.includes('"') ? `"${val}"` : val;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getOccupancyPercent(current: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.round((current / capacity) * 100);
}

export function getOccupancyColor(percent: number): string {
  if (percent >= 90) return "text-danger";
  if (percent >= 70) return "text-warning";
  return "text-success";
}
