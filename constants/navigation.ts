import {
  LayoutDashboard,
  Hotel,
  Users,
  CheckCircle2,
  MapPin,
  Calendar,
  CalendarDays,
  UserCog,
  BarChart2,
  TrendingUp,
  Bell,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  section?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",      href: "/dashboard",      icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Hospitality",    href: "/hospitality",    icon: Hotel },
      { label: "Customers",      href: "/guests",         icon: Users },
      { label: "Calendar",       href: "/calendar",       icon: CalendarDays },
      { label: "Check-ins",      href: "/check-ins",      icon: CheckCircle2 },
    ],
  },
  {
    label: "Venue & Events",
    items: [
      { label: "Venues",         href: "/venues",         icon: MapPin },
      { label: "Events",         href: "/events",         icon: Calendar },
      { label: "Staff",          href: "/staff",          icon: UserCog },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports",        href: "/reports",        icon: BarChart2 },
      { label: "Analytics",      href: "/analytics",      icon: TrendingUp },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications",  href: "/notifications",  icon: Bell,     badge: 5 },
      { label: "Settings",       href: "/settings",       icon: Settings },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
