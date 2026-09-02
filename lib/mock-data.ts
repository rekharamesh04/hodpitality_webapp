/**
 * In-memory mock backend — active only for local-only sessions (see lib/axios.ts).
 * Seeds realistic data per-resource and supports basic CRUD so the UI behaves
 * like it's talking to a real API without ever leaving the browser.
 */

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditi', 'Priya', 'Rohan', 'Ishaan', 'Ananya', 'Kabir', 'Meera', 'Arjun', 'Sara', 'Dev', 'Neha', 'Kunal', 'Riya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Patel', 'Singh', 'Rao', 'Mehta'];
function randomName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
}

// ---------------------------------------------------------------------------
// Guests
// ---------------------------------------------------------------------------
const GUEST_CATEGORIES = ['VIP', 'Speaker', 'Delegate', 'Staff', 'Press', 'regular'] as const;
export const mockGuests: any[] = Array.from({ length: 24 }, (_, i) => {
  const name = randomName();
  const checkedIn = Math.random() > 0.5;
  return {
    id: uid('guest'),
    name,
    email: emailFor(name),
    phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
    company: pick(['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', '']),
    designation: pick(['CEO', 'Manager', 'Director', 'Analyst', 'Engineer', '']),
    category: pick(GUEST_CATEGORIES),
    status: pick(['active', 'pending', 'confirmed']),
    checkedIn,
    checkInTime: checkedIn ? daysAgo(0) : undefined,
    registrationDate: daysAgo(Math.floor(Math.random() * 20)),
    createdAt: daysAgo(Math.floor(Math.random() * 20)),
    avatar: undefined,
    notes: '',
    tags: [],
  };
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
const TIERS = ['Founding', 'Signature', 'Standard'];
export const mockCustomers: any[] = Array.from({ length: 18 }, () => {
  const name = randomName();
  return {
    id: uid('cust'),
    name,
    initials: name.split(' ').map((p) => p[0]).join(''),
    email: emailFor(name),
    phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
    tier: pick(TIERS),
    visits: Math.floor(Math.random() * 30),
    balance: Math.floor(Math.random() * 5000),
    memberSince: daysAgo(Math.floor(Math.random() * 700)),
    lastVisit: daysAgo(Math.floor(Math.random() * 30)),
    nextAppointment: Math.random() > 0.5 ? daysFromNow(Math.floor(Math.random() * 14)) : undefined,
    createdAt: daysAgo(Math.floor(Math.random() * 700)),
  };
});

// ---------------------------------------------------------------------------
// Venues
// ---------------------------------------------------------------------------
export const mockVenues: any[] = [
  { id: uid('venue'), name: 'Grand Ballroom', capacity: 500, occupancy: 210, type: 'Ballroom', location: 'Level 1', status: 'active', amenities: ['AV Equipment', 'Stage', 'Catering'] },
  { id: uid('venue'), name: 'Skyline Terrace', capacity: 150, occupancy: 60, type: 'Outdoor', location: 'Rooftop', status: 'active', amenities: ['Open Air', 'Bar'] },
  { id: uid('venue'), name: 'Executive Boardroom A', capacity: 20, occupancy: 8, type: 'Meeting Room', location: 'Level 3', status: 'active', amenities: ['Video Conferencing', 'Whiteboard'] },
  { id: uid('venue'), name: 'Conference Hall B', capacity: 300, occupancy: 0, type: 'Conference', location: 'Level 2', status: 'inactive', amenities: ['Projector', 'Sound System'] },
];

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export const mockEvents: any[] = [
  { id: uid('event'), title: 'Annual Hospitality Summit', description: 'Flagship industry gathering', startDate: daysFromNow(5), endDate: daysFromNow(6), venue: 'Grand Ballroom', status: 'active', attendees: 210, registered: 245, capacity: 500, category: 'Conference', organizer: 'EntryFlow Events' },
  { id: uid('event'), title: 'Product Launch Night', description: 'Unveiling the new service line', startDate: daysFromNow(12), venue: 'Skyline Terrace', status: 'confirmed', attendees: 60, registered: 80, capacity: 150, category: 'Launch', organizer: 'Marketing Team' },
  { id: uid('event'), title: 'Partner Strategy Workshop', description: 'Quarterly planning session', startDate: daysFromNow(1), venue: 'Executive Boardroom A', status: 'active', attendees: 8, registered: 12, capacity: 20, category: 'Workshop', organizer: 'Ops Team' },
  { id: uid('event'), title: 'Q3 Review Conference', description: 'Company-wide quarterly review', startDate: daysAgo(3), venue: 'Conference Hall B', status: 'completed', attendees: 180, registered: 200, capacity: 300, category: 'Internal', organizer: 'Leadership' },
];

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------
const DEPARTMENTS = ['Front Desk', 'Operations', 'Events', 'Housekeeping', 'Security', 'F&B'];
export const mockStaff: any[] = Array.from({ length: 14 }, () => {
  const name = randomName();
  return {
    id: uid('staff'),
    name,
    email: emailFor(name),
    phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
    role: pick(['manager', 'staff', 'admin']),
    department: pick(DEPARTMENTS),
    status: pick(['active', 'active', 'active', 'inactive']),
    joinedDate: daysAgo(Math.floor(Math.random() * 900)),
    createdAt: daysAgo(Math.floor(Math.random() * 900)),
  };
});

// ---------------------------------------------------------------------------
// Check-ins
// ---------------------------------------------------------------------------
export const mockCheckIns: any[] = mockGuests
  .filter((g) => g.checkedIn)
  .map((g) => ({
    id: uid('checkin'),
    guestId: g.id,
    guestName: g.name,
    guestEmail: g.email,
    checkInTime: g.checkInTime ?? daysAgo(0),
    checkInMethod: pick(['QR', 'Manual', 'Self']),
    venue: pick(mockVenues).name,
    event: pick(mockEvents).title,
    badgePrinted: Math.random() > 0.4,
    verifiedBy: randomName(),
  }));

// ---------------------------------------------------------------------------
// Hospitality bookings
// ---------------------------------------------------------------------------
export const mockHospitality: any[] = Array.from({ length: 10 }, () => {
  const guest = pick(mockGuests);
  return {
    id: uid('hosp'),
    guestId: guest.id,
    guestName: guest.name,
    type: pick(['Hotel', 'Transport', 'Meal', 'Airport Pickup', 'Special Request']),
    description: 'Service arrangement',
    status: pick(['pending', 'confirmed', 'completed']),
    bookingDate: daysAgo(Math.floor(Math.random() * 10)),
    serviceDate: daysFromNow(Math.floor(Math.random() * 10)),
    venue: pick(mockVenues).name,
    cost: Math.floor(Math.random() * 300) * 10,
  };
});

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------
export const mockRegistrations: any[] = mockGuests.slice(0, 15).map((g) => ({
  id: uid('reg'),
  guestName: g.name,
  guestEmail: g.email,
  phone: g.phone,
  event: pick(mockEvents).title,
  registrationDate: daysAgo(Math.floor(Math.random() * 15)),
  status: pick(['confirmed', 'pending', 'cancelled']),
  paymentStatus: pick(['paid', 'pending', 'failed']),
  amount: Math.floor(Math.random() * 50) * 10,
  category: g.category,
}));

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const mockNotifications: any[] = [
  { id: uid('notif'), title: 'New guest registered', message: 'A new VIP guest just registered for the Annual Summit.', type: 'success', read: false, createdAt: daysAgo(0) },
  { id: uid('notif'), title: 'Check-in surge', message: 'Front desk is seeing higher than usual check-in volume.', type: 'warning', read: false, createdAt: daysAgo(0) },
  { id: uid('notif'), title: 'Venue capacity alert', title2: '', message: 'Grand Ballroom is at 80% capacity.', type: 'warning', read: true, createdAt: daysAgo(1) },
  { id: uid('notif'), title: 'Report ready', message: 'Your weekly report has been generated.', type: 'info', read: true, createdAt: daysAgo(2) },
  { id: uid('notif'), title: 'Staff schedule updated', message: 'Next week\'s schedule has been published.', type: 'info', read: true, createdAt: daysAgo(3) },
];

// ---------------------------------------------------------------------------
// Resellers / Companies
// ---------------------------------------------------------------------------
export const mockResellers: any[] = [
  { id: uid('resell'), name: 'Global Events Partners', email: 'contact@globalevents.example', status: 'active', createdAt: daysAgo(400), updatedAt: daysAgo(10) },
  { id: uid('resell'), name: 'Premier Hospitality Group', email: 'info@premierhg.example', status: 'active', createdAt: daysAgo(300), updatedAt: daysAgo(5) },
];
export const mockCompanies: any[] = [
  { id: uid('co'), name: 'Acme Hospitality', email: 'admin@acmehospitality.example', status: 'active', reseller_id: mockResellers[0].id, tenant_id: `tenant-${mockResellers[0].id}`, createdAt: daysAgo(200), updatedAt: daysAgo(2) },
  { id: uid('co'), name: 'Skyline Venues', email: 'admin@skylinevenues.example', status: 'active', reseller_id: mockResellers[1].id, tenant_id: `tenant-${mockResellers[1].id}`, createdAt: daysAgo(150), updatedAt: daysAgo(8) },
];

// ---------------------------------------------------------------------------
// Appointments / Calendar
// ---------------------------------------------------------------------------
export const mockAppointments: any[] = Array.from({ length: 8 }, () => {
  const customer = pick(mockCustomers);
  const staff = pick(mockStaff);
  return {
    id: uid('appt'),
    date: daysFromNow(Math.floor(Math.random() * 7)).slice(0, 10),
    guestId: customer.id,
    guestName: customer.name,
    staffId: staff.id,
    staffName: staff.name,
    title: pick(['Consultation', 'Follow-up', 'Onboarding', 'Review Meeting']),
    startTime: '10:00',
    endTime: '11:00',
    status: pick(['scheduled', 'completed', 'cancelled']),
  };
});

// ---------------------------------------------------------------------------
// Dashboard / reports
// ---------------------------------------------------------------------------
export function mockDashboardStats() {
  return {
    todayCheckIns: mockCheckIns.length,
    guestsArrived: mockGuests.filter((g) => g.checkedIn).length,
    pendingGuests: mockGuests.filter((g) => g.status === 'pending').length,
    hospitalityBookings: mockHospitality.length,
    venueOccupancy: Math.round(
      (mockVenues.reduce((s, v) => s + v.occupancy, 0) / mockVenues.reduce((s, v) => s + v.capacity, 0)) * 100
    ),
    totalGuests: mockGuests.length,
    totalEvents: mockEvents.length,
    activeStaff: mockStaff.filter((s) => s.status === 'active').length,
  };
}

export function mockActivityFeed() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: uid('act'),
    type: pick(['check_in', 'registration', 'hospitality', 'event', 'system']),
    title: pick(['New check-in', 'Guest registered', 'Booking confirmed', 'Event updated', 'System sync']),
    description: pick(mockGuests).name + ' — ' + pick(['checked in at Grand Ballroom', 'registered for the summit', 'booked airport pickup', 'RSVP\'d to Product Launch']),
    timestamp: daysAgo(i * 0.2),
    user: randomName(),
  }));
}

export function mockChartData(type: string) {
  if (type === 'guest-arrivals') {
    return [
      { hour: '08:00', arrivals: 2 },
      { hour: '09:00', arrivals: 4 },
      { hour: '10:00', arrivals: 11 },
      { hour: '11:00', arrivals: 8 },
      { hour: '12:00', arrivals: 14 },
      { hour: '13:00', arrivals: 7 },
      { hour: '14:00', arrivals: 9 },
      { hour: '15:00', arrivals: 15 },
      { hour: '16:00', arrivals: 12 },
      { hour: '17:00', arrivals: 10 },
      { hour: '18:00', arrivals: 6 },
    ];
  }
  if (type === 'revenue-trend') {
    return Array.from({ length: 14 }, (_, i) => ({
      date: daysAgo(14 - i - 1).slice(0, 10),
      revenue: Math.floor(Math.random() * 2500) + 800,
    }));
  }
  if (type === 'monthly-events') {
    return [
      { month: 'Oct', count: 5 },
      { month: 'Nov', count: 8 },
      { month: 'Dec', count: 12 },
      { month: 'Jan', count: 6 },
      { month: 'Feb', count: 9 },
      { month: 'Mar', count: 14 },
      { month: 'Apr', count: 11 },
      { month: 'May', count: 7 },
      { month: 'Jun', count: 10 },
      { month: 'Jul', count: 13 },
      { month: 'Aug', count: 15 },
      { month: 'Sep', count: 8 },
    ];
  }
  if (type === 'checkins') {
    return Array.from({ length: 7 }, (_, i) => ({ label: `Day ${i + 1}`, value: Math.floor(Math.random() * 40) + 10 }));
  }
  if (type === 'guest-categories') {
    return GUEST_CATEGORIES.map((cat) => ({
      label: cat,
      value: mockGuests.filter((g) => g.category === cat).length,
    }));
  }
  return Array.from({ length: 6 }, (_, i) => ({ label: `W${i + 1}`, value: Math.floor(Math.random() * 100) }));
}

export function mockDailyReports(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: daysAgo(days - i - 1).slice(0, 10),
    count: Math.floor(Math.random() * 25) + 5,
    checkIns: Math.floor(Math.random() * 30) + 5,
    registrations: Math.floor(Math.random() * 20) + 2,
    revenue: Math.floor(Math.random() * 5000) + 500,
  }));
}

export const mockSettings = {
  organization: {
    name: 'EntryFlow Admin',
    email: 'ops@entryflow.example',
    phone: '+91 90000 00000',
    address: '1 Convention Ave, Bengaluru, India',
    website: 'https://entryflow.example',
  },
  branding: { primaryColor: '#0F766E' },
  features: {
    enableNotifications: true,
    enableAnalytics: true,
    enableQRCheckIn: true,
    enableBadgePrinting: true,
  },
  notifications: { email: true, push: true, sms: false },
};

// ---------------------------------------------------------------------------
// Generic list CRUD helpers used by the mock adapter
// ---------------------------------------------------------------------------
export function findById<T extends { id: string }>(list: T[], id: string): T | undefined {
  return list.find((item) => item.id === id);
}

export function addItem<T extends Record<string, unknown>>(list: T[], input: Partial<T>, prefix: string): T {
  const item = { id: uid(prefix), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...input } as unknown as T;
  list.unshift(item);
  return item;
}

export function updateItemById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T | undefined {
  const item = findById(list, id);
  if (!item) return undefined;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  return item;
}

export function removeItemById<T extends { id: string }>(list: T[], id: string): void {
  const idx = list.findIndex((item) => item.id === id);
  if (idx !== -1) list.splice(idx, 1);
}

export const mockPayments = [
  {
    id: 'pay_001',
    registrationId: 'reg_101',
    amount: 150,
    currency: 'USD',
    paymentMethod: 'online' as const,
    method: 'credit_card',
    status: 'paid' as const,
    transactionId: 'ch_3M4abcd123',
    description: 'Tech Summit VIP Pass',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'pay_002',
    registrationId: 'reg_102',
    amount: 250.5,
    currency: 'INR',
    paymentMethod: 'card' as const,
    method: 'credit_card',
    status: 'paid' as const,
    transactionId: 'txn_987xyz',
    description: 'Healthcare Clinic Pass',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'pay_003',
    registrationId: 'reg_103',
    amount: 75,
    currency: 'INR',
    paymentMethod: 'upi' as const,
    method: 'upi',
    status: 'pending' as const,
    description: 'Salon express check-in',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
