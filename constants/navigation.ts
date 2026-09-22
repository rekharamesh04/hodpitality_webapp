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
import { DEFAULT_INDUSTRY, industryPack, type IndustryModule } from "./industry";

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
  /**
   * The area of the product this entry belongs to. An industry that does not
   * list the module is not offered the entry.
   *
   * This is presentation only. The API still serves every module to every
   * tenant, so a hidden entry is tidiness rather than a permission — real
   * per-industry authorisation would have to be enforced in the backend route
   * table as its own change.
   */
  module?: IndustryModule;
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

/**
 * The navigation, in the vocabulary of one industry.
 *
 * Labels follow the tenant: a hospital's "People" section reads Patients, a
 * school's reads Students. The `href` values never change — routes stay
 * `/guests` and `/customers` in every industry, so bookmarks, deep links and
 * notification targets keep working when a tenant is reclassified.
 */
export function getNavSections(industry?: unknown): NavSection[] {
  const t = industryPack(industry ?? DEFAULT_INDUSTRY);
  return [
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
        { label: "Check-ins", href: "/check-ins", icon: CheckCircle2, description: "Front-desk arrivals, QR and face scan" },
        { label: "Registrations", href: "/registrations", icon: ClipboardList, description: "Sign-ups and confirmations", module: "registrations" },
        { label: "Payments", href: "/payments", icon: CreditCard, description: "Revenue, refunds and statuses", module: "payments" },
        { label: t.visit.many, href: "/calendar", icon: CalendarDays, description: `${t.visit.many} and staff schedule`, module: "appointments" },
        { label: `${t.place.one} Services`, href: "/hospitality", icon: Hotel, description: `${t.place.one} service and VIP care`, module: "hospitality" },
      ],
    },
    {
      label: "People",
      menuLabel: "People",
      items: [
        { label: t.person.many, href: "/guests", icon: Users, description: `Everyone who visits this ${t.org.toLowerCase()}` },
        { label: t.account.many, href: "/customers", icon: Contact, description: `Billing and ${t.visit.many.toLowerCase()} records` },
        { label: "Staff", href: "/staff", icon: UserCog, description: "Team members and schedules" },
      ],
    },
    {
      label: "Events & Locations",
      menuLabel: "Events",
      items: [
        { label: "Events", href: "/events", icon: Calendar, description: "Schedule and manage events", module: "events" },
        { label: t.place.many, href: "/venues", icon: MapPin, description: "Spaces, capacity and occupancy" },
      ],
    },
    {
      label: "Insights",
      menuLabel: "Insights",
      items: [
        { label: "Reports", href: "/reports", icon: BarChart2, description: "Operational metrics and CSV exports" },
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
        { label: "Settings", href: "/settings", icon: Settings, description: "Profile, organisation and security" },
      ],
    },
  ];
}

/**
 * The navigation in the neutral default vocabulary.
 *
 * For call sites with no tenant context. Anything rendered to a signed-in user
 * should use `getVisibleNavSections(role, industry)` instead, so the labels
 * match the tenant.
 */
export const NAV_SECTIONS: NavSection[] = getNavSections(DEFAULT_INDUSTRY);

export const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/** Every nav entry in one industry's vocabulary, flattened. */
export function getFlatNav(industry?: unknown): NavItem[] {
  return getNavSections(industry).flatMap((s) => s.items);
}

/**
 * Sections filtered to what this role and industry may see. Sections left
 * empty are dropped.
 */
export function getVisibleNavSections(role: string | undefined, industry?: unknown): NavSection[] {
  const modules = industryPack(industry ?? DEFAULT_INDUSTRY).modules as readonly IndustryModule[];
  return getNavSections(industry)
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          (!item.roles || item.roles.includes(role ?? '')) &&
          (!item.module || modules.includes(item.module)),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

/** True when `pathname` is the item's page or one of its detail pages (e.g. /guests/123). */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
