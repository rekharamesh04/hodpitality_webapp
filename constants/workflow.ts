import {
  Users,
  CalendarDays,
  CheckCircle2,
  Pill,
  PackageCheck,
  Sparkles,
  ConciergeBell,
  Hotel,
  CreditCard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { industryPack, normalizeIndustry, type IndustryModule, type IndustrySlug } from './industry';

/**
 * The order a day's work actually happens in, per industry.
 *
 * The navigation groups screens by kind; this lists them by *when* they are
 * used, so a new member of staff can read the product front to back — who
 * arrives, what is done for them, how it is paid for. Each step is a page that
 * already exists; this file only decides the order and the words.
 *
 * Only the three built-out industries (AVAILABLE_INDUSTRIES) have a workflow.
 * The rest keep the plain grouped navigation, because a flow drawn over
 * screens they are missing would be a promise the product cannot keep.
 */

export interface WorkflowStep {
  /** The page for this step. Stable across industries, like every nav href. */
  href: string;
  /** Short name, in the tenant's vocabulary. */
  label: string;
  /** Shorter still, for the phone tab bar. Falls back to `label`. */
  short?: string;
  /** What gets done here, in one line. */
  description: string;
  icon: LucideIcon;
  /** Can be skipped — e.g. a walk-in needs no appointment. */
  optional?: boolean;
  /** Starts this step's work directly, e.g. opens the create dialog. */
  action?: { label: string; href: string };
  /** A step whose module the industry lacks is dropped, like a nav entry. */
  module?: IndustryModule;
}

type WorkflowIndustry = Extract<IndustrySlug, 'pharmacy' | 'wellness' | 'hospitality'>;

function buildWorkflow(slug: WorkflowIndustry): WorkflowStep[] {
  const t = industryPack(slug);
  const person = t.person.one.toLowerCase();
  const visit = t.visit.one.toLowerCase();

  const register: WorkflowStep = {
    href: '/guests',
    label: `Register ${person}`,
    description: `Add the ${person} once — every later step finds them by name.`,
    icon: Users,
    action: { label: `Add ${person}`, href: '/guests?action=add' },
  };

  const pay: WorkflowStep = {
    href: '/payments',
    label: 'Payments',
    description: 'Every payment recorded along the way, with refunds and status updates.',
    icon: CreditCard,
    module: 'payments',
    action: { label: 'View payment records', href: '/payments' },
  };

  switch (slug) {
    case 'pharmacy':
      return [
        register,
        {
          href: '/calendar',
          label: `Book ${visit}`,
          description: 'Consultations and immunisations. Walk-ins skip this.',
          short: t.visit.many,
          icon: CalendarDays,
          optional: true,
          module: 'appointments',
          action: { label: `New ${visit}`, href: '/calendar?action=add' },
        },
        {
          href: '/prescriptions',
          label: 'Prescriptions',
          description: `Enter the prescription to be filled for the ${person}.`,
          icon: Pill,
          module: 'prescriptions',
          action: { label: 'New prescription', href: '/prescriptions?action=add' },
        },
        {
          href: '/pickup',
          label: 'Collection',
          description: `Verify the ${person}'s identity and hand over the medicines.`,
          icon: PackageCheck,
          module: 'prescriptions',
          action: { label: 'Start a collection', href: '/pickup' },
        },
        pay,
      ];

    case 'wellness':
      return [
        register,
        {
          href: '/calendar',
          label: `Book ${visit}`,
          description: `Pick the ${visit}, ${t.practitioner.toLowerCase()} and ${t.place.one.toLowerCase()}.`,
          short: t.visit.many,
          icon: CalendarDays,
          module: 'appointments',
          action: { label: `New ${visit}`, href: '/calendar?action=add' },
        },
        {
          href: '/check-ins',
          label: 'Check in',
          description: `Mark the ${person} as arrived — by QR, face or by hand.`,
          icon: CheckCircle2,
          action: { label: 'Check someone in', href: '/check-ins?action=checkin' },
        },
        {
          href: '/treatments',
          label: `${t.visit.one} Board`,
          short: 'Board',
          description: `Run the day: who is in which ${t.place.one.toLowerCase()}, and mark each one complete.`,
          icon: Sparkles,
          module: 'treatments',
        },
        {
          href: '/hospitality',
          label: 'Extras',
          description: 'Refreshments, lockers and add-ons during the visit.',
          icon: Hotel,
          optional: true,
          module: 'hospitality',
          action: { label: 'Add an extra', href: '/hospitality?action=add' },
        },
        pay,
      ];

    case 'hospitality':
      return [
        register,
        {
          href: '/calendar',
          label: `Take ${visit}`,
          description: `Reserve the ${t.place.one.toLowerCase()} and the dates of the stay.`,
          short: t.visit.many,
          icon: CalendarDays,
          module: 'appointments',
          action: { label: `New ${visit}`, href: '/calendar?action=add' },
        },
        {
          href: '/front-desk',
          label: 'Front Desk',
          description: `Check the ${person} in on arrival, and out when they leave.`,
          icon: ConciergeBell,
          module: 'frontdesk',
        },
        {
          href: '/hospitality',
          label: `${t.place.one} Services`,
          description: 'Room service, transport and VIP care during the stay.',
          icon: Hotel,
          optional: true,
          module: 'hospitality',
          action: { label: 'Book a service', href: '/hospitality?action=add' },
        },
        pay,
      ];
  }
}

function hasWorkflow(slug: IndustrySlug): slug is WorkflowIndustry {
  return slug === 'pharmacy' || slug === 'wellness' || slug === 'hospitality';
}

/**
 * The ordered steps for an industry, or an empty list when it has none.
 * Never throws — an unknown industry means no workflow.
 */
export function getWorkflow(industry: unknown): WorkflowStep[] {
  const slug = normalizeIndustry(industry);
  if (!hasWorkflow(slug)) return [];
  const modules = industryPack(slug).modules as readonly IndustryModule[];
  return buildWorkflow(slug).filter((s) => !s.module || modules.includes(s.module));
}

/** The index of the step `pathname` belongs to (detail pages included), or -1. */
export function workflowStepIndex(steps: readonly WorkflowStep[], pathname: string): number {
  return steps.findIndex((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
}
