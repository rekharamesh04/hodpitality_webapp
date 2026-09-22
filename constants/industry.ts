/**
 * The per-industry vocabulary.
 *
 * A tenant's industry decides what the product CALLS things — never what it
 * stores. One person record stays one person record; "Patient", "Guest" and
 * "Student" are three labels for the same row, so changing a company's
 * industry never migrates data.
 *
 * Must stay identical to INDUSTRIES in the backend (hospitality_lambda.py) and
 * to utils/terminology.ts in the mobile app. The backend refuses any slug that
 * is not in its own copy with a 400.
 *
 * `categories` and `tiers` are the options offered when creating a NEW record.
 * Rows created under a different industry keep whatever value they already
 * hold, so every reader must tolerate a value that is not in this list.
 *
 * `modules` drives which navigation entries a tenant is offered. It is a
 * convenience, not a permission: the API still serves every module to every
 * tenant, so hiding a nav item is cosmetic rather than a security boundary.
 */

export interface Noun {
  one: string;
  many: string;
}

export interface IndustryService {
  id: string;
  name: string;
  duration: number;
  category: string;
}

export interface IndustryPack {
  label: string;
  /** The person who visits — the GUEST directory used for check-in. */
  person: Noun;
  /** The billing / appointment record — the CUSTOMER entity, a different thing. */
  account: Noun;
  visit: Noun;
  place: Noun;
  org: string;
  practitioner: string;
  assistant: string;
  categories: readonly string[];
  tiers: readonly string[];
  /** Category or tier values meaning "this person needs special attention". */
  priority: readonly string[];
  modules: readonly IndustryModule[];
  /** The service menu a tenant starts with, before it saves its own. */
  services: readonly IndustryService[];
}

/** Optional areas of the product a tenant may or may not be offered. */
export type IndustryModule =
  | 'appointments'
  | 'events'
  | 'hospitality'
  | 'prescriptions'
  | 'payments'
  | 'registrations';

export const INDUSTRIES = {
  healthcare: {
    label: 'Healthcare',
    person: { one: 'Patient', many: 'Patients' },
    account: { one: 'Patient Account', many: 'Patient Accounts' },
    visit: { one: 'Appointment', many: 'Appointments' },
    place: { one: 'Room', many: 'Rooms' },
    org: 'Hospital',
    practitioner: 'Doctor',
    assistant: 'Nurse',
    categories: ['Inpatient', 'Outpatient', 'Emergency', 'Day Care', 'regular'],
    tiers: ['Priority', 'Standard'],
    priority: ['Emergency', 'Priority'],
    modules: ['appointments', 'events', 'hospitality', 'prescriptions', 'payments', 'registrations'],
    services: [
      { id: 'svc-consultation', name: 'Consultation', duration: 30, category: 'clinic' },
      { id: 'svc-follow-up', name: 'Follow-up Visit', duration: 15, category: 'clinic' },
      { id: 'svc-diagnostics', name: 'Diagnostics', duration: 45, category: 'clinic' },
      { id: 'svc-vaccination', name: 'Vaccination', duration: 15, category: 'clinic' },
    ],
  },
  hospitality: {
    label: 'Hospitality',
    person: { one: 'Guest', many: 'Guests' },
    account: { one: 'Guest Account', many: 'Guest Accounts' },
    visit: { one: 'Booking', many: 'Bookings' },
    place: { one: 'Room', many: 'Rooms' },
    org: 'Hotel',
    practitioner: 'Concierge',
    assistant: 'Attendant',
    categories: ['VIP', 'Corporate', 'Leisure', 'Group', 'regular'],
    tiers: ['Founding', 'Signature', 'Standard'],
    priority: ['VIP', 'Founding', 'Signature'],
    modules: ['appointments', 'events', 'hospitality', 'payments', 'registrations'],
    services: [
      { id: 'svc-check-in', name: 'Guest Check-in', duration: 15, category: 'front-desk' },
      { id: 'svc-room-service', name: 'Room Service', duration: 20, category: 'hospitality' },
      { id: 'svc-transport', name: 'Airport Transfer', duration: 45, category: 'transport' },
      { id: 'svc-spa', name: 'Spa Treatment', duration: 60, category: 'spa' },
      { id: 'svc-dining', name: 'Dining Reservation', duration: 90, category: 'hospitality' },
    ],
  },
  education: {
    label: 'Education',
    person: { one: 'Student', many: 'Students' },
    account: { one: 'Student Account', many: 'Student Accounts' },
    visit: { one: 'Class', many: 'Classes' },
    place: { one: 'Classroom', many: 'Classrooms' },
    org: 'School',
    practitioner: 'Teacher',
    assistant: 'Assistant',
    categories: ['Full-time', 'Part-time', 'Exchange', 'Alumni', 'regular'],
    tiers: ['Scholarship', 'Standard'],
    priority: ['Scholarship'],
    modules: ['appointments', 'events', 'payments', 'registrations'],
    services: [
      { id: 'svc-enrolment', name: 'Enrolment', duration: 30, category: 'admin' },
      { id: 'svc-tutoring', name: 'Tutoring Session', duration: 60, category: 'teaching' },
      { id: 'svc-parent-meeting', name: 'Parent Meeting', duration: 30, category: 'admin' },
      { id: 'svc-counselling', name: 'Counselling', duration: 45, category: 'support' },
    ],
  },
  fitness: {
    label: 'Fitness or Recreation',
    person: { one: 'Member', many: 'Members' },
    account: { one: 'Membership', many: 'Memberships' },
    visit: { one: 'Session', many: 'Sessions' },
    place: { one: 'Studio', many: 'Studios' },
    org: 'Club',
    practitioner: 'Trainer',
    assistant: 'Assistant',
    categories: ['Premium', 'Standard', 'Trial', 'Day Pass', 'regular'],
    tiers: ['Founding', 'Premium', 'Standard'],
    priority: ['Premium', 'Founding'],
    modules: ['appointments', 'events', 'payments', 'registrations'],
    services: [
      { id: 'svc-induction', name: 'Gym Induction', duration: 45, category: 'onboarding' },
      { id: 'svc-personal-training', name: 'Personal Training', duration: 60, category: 'training' },
      { id: 'svc-class', name: 'Group Class', duration: 45, category: 'training' },
      { id: 'svc-assessment', name: 'Fitness Assessment', duration: 30, category: 'training' },
    ],
  },
  professional_services: {
    label: 'Professional Services or Legal',
    person: { one: 'Client', many: 'Clients' },
    account: { one: 'Client Account', many: 'Client Accounts' },
    visit: { one: 'Consultation', many: 'Consultations' },
    place: { one: 'Meeting Room', many: 'Meeting Rooms' },
    org: 'Firm',
    practitioner: 'Adviser',
    assistant: 'Associate',
    categories: ['Retainer', 'Project', 'Consultation', 'regular'],
    tiers: ['Key Account', 'Standard'],
    priority: ['Retainer', 'Key Account'],
    modules: ['appointments', 'payments', 'registrations'],
    services: [
      { id: 'svc-consultation', name: 'Consultation', duration: 45, category: 'advisory' },
      { id: 'svc-case-review', name: 'Case Review', duration: 60, category: 'advisory' },
      { id: 'svc-document-signing', name: 'Document Signing', duration: 20, category: 'admin' },
    ],
  },
  retail: {
    label: 'Retail',
    person: { one: 'Customer', many: 'Customers' },
    account: { one: 'Customer', many: 'Customers' },
    visit: { one: 'Visit', many: 'Visits' },
    place: { one: 'Store', many: 'Stores' },
    org: 'Store',
    practitioner: 'Specialist',
    assistant: 'Associate',
    categories: ['Loyalty', 'Wholesale', 'Walk-in', 'regular'],
    tiers: ['Gold', 'Silver', 'Standard'],
    priority: ['Loyalty', 'Gold'],
    modules: ['appointments', 'payments'],
    services: [
      { id: 'svc-personal-shopping', name: 'Personal Shopping', duration: 45, category: 'retail' },
      { id: 'svc-fitting', name: 'Fitting Appointment', duration: 30, category: 'retail' },
      { id: 'svc-collection', name: 'Order Collection', duration: 10, category: 'retail' },
      { id: 'svc-repair', name: 'Repair Drop-off', duration: 15, category: 'retail' },
    ],
  },
  real_estate: {
    label: 'Real Estate or Housing',
    person: { one: 'Resident', many: 'Residents' },
    account: { one: 'Tenancy', many: 'Tenancies' },
    visit: { one: 'Viewing', many: 'Viewings' },
    place: { one: 'Unit', many: 'Units' },
    org: 'Property',
    practitioner: 'Agent',
    assistant: 'Coordinator',
    categories: ['Owner', 'Tenant', 'Prospect', 'regular'],
    tiers: ['Priority', 'Standard'],
    priority: ['Owner', 'Priority'],
    modules: ['appointments', 'payments', 'registrations'],
    services: [
      { id: 'svc-viewing', name: 'Property Viewing', duration: 30, category: 'lettings' },
      { id: 'svc-valuation', name: 'Valuation', duration: 45, category: 'lettings' },
      { id: 'svc-key-handover', name: 'Key Handover', duration: 20, category: 'admin' },
      { id: 'svc-maintenance', name: 'Maintenance Visit', duration: 60, category: 'facilities' },
    ],
  },
  government: {
    label: 'Government Services',
    person: { one: 'Citizen', many: 'Citizens' },
    account: { one: 'Case', many: 'Cases' },
    visit: { one: 'Appointment', many: 'Appointments' },
    place: { one: 'Counter', many: 'Counters' },
    org: 'Office',
    practitioner: 'Officer',
    assistant: 'Clerk',
    categories: ['Resident', 'Non-resident', 'Business', 'regular'],
    tiers: ['Priority', 'Standard'],
    priority: ['Priority'],
    modules: ['appointments', 'registrations'],
    services: [
      { id: 'svc-application', name: 'Application Appointment', duration: 30, category: 'counter' },
      { id: 'svc-document-collection', name: 'Document Collection', duration: 15, category: 'counter' },
      { id: 'svc-verification', name: 'Identity Verification', duration: 20, category: 'counter' },
    ],
  },
  events: {
    label: 'Entertainment or Events',
    person: { one: 'Attendee', many: 'Attendees' },
    account: { one: 'Attendee Account', many: 'Attendee Accounts' },
    visit: { one: 'Registration', many: 'Registrations' },
    place: { one: 'Venue', many: 'Venues' },
    org: 'Organiser',
    practitioner: 'Host',
    assistant: 'Crew',
    categories: ['VIP', 'Speaker', 'Delegate', 'Press', 'Exhibitor', 'regular'],
    tiers: ['Founding', 'Signature', 'Standard'],
    priority: ['VIP', 'Speaker', 'Founding', 'Signature'],
    modules: ['appointments', 'events', 'payments', 'registrations'],
    services: [
      { id: 'svc-check-in', name: 'Attendee Check-in', duration: 10, category: 'front-desk' },
      { id: 'svc-registration', name: 'On-site Registration', duration: 15, category: 'front-desk' },
      { id: 'svc-badge', name: 'Badge Printing', duration: 5, category: 'front-desk' },
      { id: 'svc-vip', name: 'VIP Reception', duration: 60, category: 'hospitality' },
    ],
  },
  transportation: {
    label: 'Transportation',
    person: { one: 'Passenger', many: 'Passengers' },
    account: { one: 'Passenger Account', many: 'Passenger Accounts' },
    visit: { one: 'Trip', many: 'Trips' },
    place: { one: 'Gate', many: 'Gates' },
    org: 'Operator',
    practitioner: 'Crew',
    assistant: 'Attendant',
    categories: ['First', 'Business', 'Economy', 'Crew', 'regular'],
    tiers: ['Platinum', 'Gold', 'Standard'],
    priority: ['First', 'Platinum'],
    modules: ['payments', 'registrations'],
    services: [
      { id: 'svc-boarding', name: 'Boarding', duration: 15, category: 'gate' },
      { id: 'svc-baggage', name: 'Baggage Drop', duration: 10, category: 'gate' },
      { id: 'svc-assistance', name: 'Special Assistance', duration: 30, category: 'gate' },
    ],
  },
  corporate: {
    label: 'Corporate or Workplace',
    person: { one: 'Visitor', many: 'Visitors' },
    account: { one: 'Visitor Account', many: 'Visitor Accounts' },
    visit: { one: 'Meeting', many: 'Meetings' },
    place: { one: 'Meeting Room', many: 'Meeting Rooms' },
    org: 'Company',
    practitioner: 'Host',
    assistant: 'Coordinator',
    categories: ['Visitor', 'Contractor', 'Interview', 'Vendor', 'regular'],
    tiers: ['Priority', 'Standard'],
    priority: ['Priority'],
    modules: ['appointments', 'events', 'registrations'],
    services: [
      { id: 'svc-visitor-check-in', name: 'Visitor Check-in', duration: 10, category: 'front-desk' },
      { id: 'svc-meeting', name: 'Meeting Room Booking', duration: 60, category: 'facilities' },
      { id: 'svc-interview', name: 'Interview', duration: 45, category: 'people' },
      { id: 'svc-induction', name: 'Contractor Induction', duration: 30, category: 'safety' },
    ],
  },
  financial: {
    label: 'Banking or Financial Services',
    person: { one: 'Client', many: 'Clients' },
    account: { one: 'Client Account', many: 'Client Accounts' },
    visit: { one: 'Appointment', many: 'Appointments' },
    place: { one: 'Branch', many: 'Branches' },
    org: 'Bank',
    practitioner: 'Adviser',
    assistant: 'Teller',
    categories: ['Priority', 'Business', 'Retail', 'regular'],
    tiers: ['Private', 'Priority', 'Standard'],
    priority: ['Priority', 'Private'],
    modules: ['appointments', 'payments', 'registrations'],
    services: [
      { id: 'svc-account-opening', name: 'Account Opening', duration: 45, category: 'branch' },
      { id: 'svc-advisory', name: 'Financial Advice', duration: 60, category: 'advisory' },
      { id: 'svc-loan', name: 'Loan Consultation', duration: 45, category: 'advisory' },
      { id: 'svc-kyc', name: 'Identity Verification', duration: 20, category: 'branch' },
    ],
  },
  manufacturing: {
    label: 'Manufacturing or Industrial',
    person: { one: 'Worker', many: 'Workers' },
    account: { one: 'Worker Record', many: 'Worker Records' },
    visit: { one: 'Shift', many: 'Shifts' },
    place: { one: 'Site', many: 'Sites' },
    org: 'Plant',
    practitioner: 'Supervisor',
    assistant: 'Operator',
    categories: ['Employee', 'Contractor', 'Vendor', 'Auditor', 'regular'],
    tiers: ['Permanent', 'Temporary'],
    priority: ['Auditor'],
    modules: ['events', 'registrations'],
    services: [
      { id: 'svc-site-induction', name: 'Site Induction', duration: 45, category: 'safety' },
      { id: 'svc-contractor-sign-in', name: 'Contractor Sign-in', duration: 10, category: 'gate' },
      { id: 'svc-audit', name: 'Audit Visit', duration: 120, category: 'quality' },
    ],
  },
  wellness: {
    label: 'Salon, Spa or Wellness',
    person: { one: 'Client', many: 'Clients' },
    account: { one: 'Client', many: 'Clients' },
    visit: { one: 'Treatment', many: 'Treatments' },
    place: { one: 'Suite', many: 'Suites' },
    org: 'Spa',
    practitioner: 'Therapist',
    assistant: 'Assistant',
    categories: ['Member', 'Walk-in', 'Package', 'regular'],
    tiers: ['Founding', 'Signature', 'Standard'],
    priority: ['Member', 'Founding', 'Signature'],
    modules: ['appointments', 'hospitality', 'payments'],
    services: [
      { id: 'svc-consultation', name: 'Consultation', duration: 20, category: 'wellness' },
      { id: 'svc-treatment', name: 'Treatment', duration: 60, category: 'wellness' },
      { id: 'svc-massage', name: 'Massage', duration: 60, category: 'wellness' },
      { id: 'svc-package', name: 'Package Session', duration: 90, category: 'wellness' },
    ],
  },
  community: {
    label: 'Nonprofit, Community or Worship',
    person: { one: 'Member', many: 'Members' },
    account: { one: 'Member Account', many: 'Member Accounts' },
    visit: { one: 'Gathering', many: 'Gatherings' },
    place: { one: 'Hall', many: 'Halls' },
    org: 'Organisation',
    practitioner: 'Leader',
    assistant: 'Volunteer',
    categories: ['Member', 'Volunteer', 'Visitor', 'regular'],
    tiers: ['Patron', 'Standard'],
    priority: ['Patron'],
    modules: ['events', 'registrations'],
    services: [
      { id: 'svc-membership', name: 'Membership Sign-up', duration: 20, category: 'admin' },
      { id: 'svc-gathering', name: 'Gathering', duration: 90, category: 'events' },
      { id: 'svc-volunteering', name: 'Volunteer Shift', duration: 180, category: 'volunteering' },
    ],
  },
  other: {
    label: 'Other',
    person: { one: 'Visitor', many: 'Visitors' },
    account: { one: 'Customer', many: 'Customers' },
    visit: { one: 'Visit', many: 'Visits' },
    place: { one: 'Venue', many: 'Venues' },
    org: 'Organisation',
    practitioner: 'Specialist',
    assistant: 'Assistant',
    categories: ['VIP', 'Standard', 'regular'],
    tiers: ['Founding', 'Signature', 'Standard'],
    priority: ['VIP', 'Founding', 'Signature'],
    modules: ['appointments', 'events', 'hospitality', 'prescriptions', 'payments', 'registrations'],
    services: [
      { id: 'svc-check-in', name: 'Visitor Check-in', duration: 15, category: 'front-desk' },
      { id: 'svc-consultation', name: 'Consultation', duration: 30, category: 'general' },
      { id: 'svc-appointment', name: 'Appointment', duration: 30, category: 'general' },
    ],
  },
} as const satisfies Record<string, IndustryPack>;

export type IndustrySlug = keyof typeof INDUSTRIES;

export const DEFAULT_INDUSTRY: IndustrySlug = 'other';

export const INDUSTRY_SLUGS = Object.keys(INDUSTRIES) as IndustrySlug[];

/** Options for the industry picker on the company form, alphabetical with "Other" last. */
export const INDUSTRY_OPTIONS: { slug: IndustrySlug; label: string }[] = INDUSTRY_SLUGS
  .map((slug) => ({ slug, label: INDUSTRIES[slug].label }))
  .sort((a, b) => {
    if (a.slug === DEFAULT_INDUSTRY) return 1;
    if (b.slug === DEFAULT_INDUSTRY) return -1;
    return a.label.localeCompare(b.label);
  });

export function isIndustrySlug(value: unknown): value is IndustrySlug {
  return typeof value === 'string' && value in INDUSTRIES;
}

/**
 * A stored industry value mapped onto a known slug, or the default.
 *
 * Total by design: the value arrives from the API, where nothing constrains
 * it, and every caller is on a render path where throwing would cost a page
 * rather than a label.
 */
export function normalizeIndustry(value: unknown): IndustrySlug {
  if (typeof value !== 'string') return DEFAULT_INDUSTRY;
  const slug = value.trim().toLowerCase();
  return isIndustrySlug(slug) ? slug : DEFAULT_INDUSTRY;
}

/** The vocabulary for an industry. Never throws — unknown means default. */
export function industryPack(value: unknown): IndustryPack {
  return INDUSTRIES[normalizeIndustry(value)];
}

/** The display name of an industry, e.g. "Healthcare". */
export function industryLabel(value: unknown): string {
  return industryPack(value).label;
}

/** What `company_admin` is called in this industry, e.g. "Hotel Admin". */
export function industryAdminLabel(value: unknown): string {
  return `${industryPack(value).org} Admin`;
}

/** Whether a tenant in this industry is offered a given area of the product. */
export function industryHasModule(value: unknown, module: IndustryModule): boolean {
  return (industryPack(value).modules as readonly IndustryModule[]).includes(module);
}
