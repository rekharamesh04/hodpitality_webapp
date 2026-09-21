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
  /** One-line summary shown in the top-bar dropdown menus. */
  description?: string;
  /** Allowed roles — omit means every role can see it */
  roles?: string[];
}

export interface NavSection {
  label: string;
  /** Short label used in the top navigation bar. */
  menuLabel: string;
  items: NavItem[];
}

// Role groups — names must match constants/roles.ts (the backend's role list).
const ADMIN_ONLY = ['super_admin'];
const ADMIN_AND_RESELLER = ['super_admin', 'reseller'];
const COMPANY_ROLES = ['super_admin', 'reseller', 'company_admin'];

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    menuLabel: "Dashboard",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Today at a glance" },
    ],
  },
  {
    label: "Operations",
    menuLabel: "Operations",
    items: [
      { label: "Check-ins",     href: "/check-ins",      icon: CheckCircle2,  description: "Front-desk arrivals, QR and face scan" },
      { label: "Registrations", href: "/registrations", icon: ClipboardList, description: "Event sign-ups and confirmations" },
      { label: "Payments",      href: "/payments",      icon: CreditCard,    description: "Revenue, refunds and statuses" },
      { label: "Calendar",      href: "/calendar",       icon: CalendarDays,  description: "Appointments and staff schedule" },
      { label: "Hospitality",   href: "/hospitality",    icon: Hotel,         description: "Hotels, transport and VIP care" },
    ],
  },
  {
    label: "People",
    menuLabel: "People",
    items: [
      { label: "Guests",    href: "/guests",    icon: Users,   description: "Visitors, attendees and VIPs" },
      { label: "Customers", href: "/customers", icon: Contact, description: "Spa and service clients" },
      { label: "Staff",     href: "/staff",     icon: UserCog, description: "Team members and schedules" },
    ],
  },
  {
    label: "Events & Locations",
    menuLabel: "Events",
    items: [
      { label: "Events", href: "/events", icon: Calendar, description: "Schedule and manage events" },
      { label: "Venues", href: "/venues", icon: MapPin,   description: "Spaces, capacity and occupancy" },
    ],
  },
  {
    label: "Insights",
    menuLabel: "Insights",
    items: [
      { label: "Reports",   href: "/reports",   icon: BarChart2,  description: "Operational metrics and CSV exports" },
      { label: "Analytics", href: "/analytics", icon: TrendingUp, description: "Trends, revenue and performance", roles: ADMIN_AND_RESELLER },
    ],
  },
  {
    label: "Administration",
    menuLabel: "Admin",
    items: [
      // Resellers tab: Admin only
      { label: "Resellers", href: "/resellers", icon: Building2, description: "Partner organisations", roles: ADMIN_ONLY },
      // Companies tab: Admin + Reseller Admin (manage) + Company Admin (their own company)
      { label: "Companies", href: "/companies", icon: Briefcase, description: "Client companies and admins", roles: COMPANY_ROLES },
      { label: "Notifications", href: "/notifications", icon: Bell, description: "Alerts and activity inbox" },
      { label: "Settings",      href: "/settings",      icon: Settings, description: "Profile, organisation and security" },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/** Sections filtered to what the given role may see (sections left empty are dropped). */
export function getVisibleNavSections(role: string | undefined): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role ?? '')),
  })).filter((section) => section.items.length > 0);
}

/** True when `pathname` is the item's page or one of its detail pages (e.g. /guests/123). */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
