import {
  LayoutDashboard,
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
  Building2,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  section?: string;
  /** Allowed roles — omit means every role can see it */
  roles?: string[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Role constants for readability
const ALL_ROLES = undefined; // no restriction
const SUPER_ONLY = ['super_admin'];
const SUPER_AND_RESELLER = ['super_admin', 'reseller_admin'];

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Customers",  href: "/guests",    icon: Users },
      { label: "Calendar",   href: "/calendar",  icon: CalendarDays },
      { label: "Check-ins",  href: "/check-ins", icon: CheckCircle2 },
    ],
  },
  {
    label: "Venue & Events",
    items: [
      { label: "Venues", href: "/venues", icon: MapPin },
      { label: "Events", href: "/events", icon: Calendar },
      { label: "Staff",  href: "/staff",  icon: UserCog },
    ],
  },
  {
    label: "Multi-Tenant",
    items: [
      // Resellers tab: Super Admin only
      { label: "Resellers", href: "/resellers", icon: Building2, roles: SUPER_ONLY },
      // Companies tab: Super Admin + Reseller Admin
      { label: "Companies", href: "/companies", icon: Briefcase, roles: SUPER_AND_RESELLER },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports",   href: "/reports",   icon: BarChart2 },
      { label: "Analytics", href: "/analytics", icon: TrendingUp, roles: SUPER_AND_RESELLER },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell, badge: 5 },
      { label: "Settings",      href: "/settings",      icon: Settings },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
