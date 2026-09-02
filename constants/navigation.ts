import {
  LayoutDashboard,
  Users,
  Contact,
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
  ClipboardList,
  Hotel,
  CreditCard,
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
const COMPANY_ROLES = ['super_admin', 'reseller_admin', 'reseller', 'company_admin'];

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
      { label: "Registrations", href: "/registrations", icon: ClipboardList },
      { label: "Payments",      href: "/payments",      icon: CreditCard },
      { label: "Calendar",      href: "/calendar",       icon: CalendarDays },
      { label: "Check-ins",     href: "/check-ins",      icon: CheckCircle2 },
      { label: "Hospitality",   href: "/hospitality",    icon: Hotel },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Guests",    href: "/guests",    icon: Users },
      { label: "Customers", href: "/customers", icon: Contact },
      { label: "Staff",     href: "/staff",     icon: UserCog },
    ],
  },
  {
    label: "Events & Locations",
    items: [
      { label: "Events", href: "/events", icon: Calendar },
      { label: "Venues", href: "/venues", icon: MapPin },
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
    label: "Administration",
    items: [
      // Resellers tab: Super Admin only
      { label: "Resellers", href: "/resellers", icon: Building2, roles: SUPER_ONLY },
      // Companies tab: Super Admin + Reseller Admin (manage) + Company Admin (their own company)
      { label: "Companies", href: "/companies", icon: Briefcase, roles: COMPANY_ROLES },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: 5 },
      { label: "Settings",      href: "/settings",      icon: Settings },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
