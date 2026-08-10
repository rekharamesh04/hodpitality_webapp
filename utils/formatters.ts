import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from "date-fns";

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return "—";
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "MMM d, yyyy · h:mm a");
  } catch {
    return "—";
  }
}

export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "h:mm a");
  } catch {
    return "—";
  }
}

export function formatRelative(date: string | Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
    if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatPhoneNumber(phone: string): string {
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
