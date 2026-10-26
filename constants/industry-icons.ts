import {
  Banknote, Briefcase, Building, Building2, Bus, Dumbbell, Factory, GraduationCap, HeartHandshake,
  Hotel, House, Landmark, Pill, ShoppingBag, Sparkles, Stethoscope, Ticket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { normalizeIndustry, type IndustrySlug } from './industry';

/**
 * One icon per industry, so each workspace is recognisable at a glance in the
 * super admin's console. An industry added later without an entry here gets
 * the generic building rather than nothing.
 */
const INDUSTRY_ICONS: Partial<Record<IndustrySlug, LucideIcon>> = {
  healthcare: Stethoscope,
  pharmacy: Pill,
  hospitality: Hotel,
  education: GraduationCap,
  fitness: Dumbbell,
  professional_services: Briefcase,
  retail: ShoppingBag,
  real_estate: House,
  government: Landmark,
  events: Ticket,
  transportation: Bus,
  corporate: Building,
  financial: Banknote,
  manufacturing: Factory,
  wellness: Sparkles,
  community: HeartHandshake,
};

export function industryIcon(industry: unknown): LucideIcon {
  return INDUSTRY_ICONS[normalizeIndustry(industry)] ?? Building2;
}
