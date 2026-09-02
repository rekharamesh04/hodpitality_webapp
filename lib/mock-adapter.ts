import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  mockGuests, mockCustomers, mockVenues, mockEvents, mockStaff, mockCheckIns,
  mockHospitality, mockRegistrations, mockNotifications, mockResellers, mockCompanies,
  mockAppointments, mockSettings, mockPayments,
  mockDashboardStats, mockActivityFeed, mockChartData, mockDailyReports,
  findById, addItem, updateItemById, removeItemById,
} from './mock-data';

function parseBody(data: unknown): any {
  if (typeof data === 'string') {
    try { return JSON.parse(data || '{}'); } catch { return {}; }
  }
  return data ?? {};
}

function paginated(list: any[], url: string) {
  const q = new URLSearchParams(url.split('?')[1] ?? '');
  const page = Number(q.get('page') ?? 1);
  const limit = Number(q.get('limit') ?? 20);
  const search = q.get('search')?.toLowerCase();
  let filtered = list;
  if (search) {
    filtered = filtered.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search)
    );
  }
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    nextCursor: start + limit < filtered.length ? String(page + 1) : null,
  };
}

function unwrapped(list: any[], url: string) {
  const q = new URLSearchParams(url.split('?')[1] ?? '');
  const search = q.get('search')?.toLowerCase();
  const status = q.get('status');
  let filtered = list;
  if (search) filtered = filtered.filter((item) => JSON.stringify(item).toLowerCase().includes(search));
  if (status) filtered = filtered.filter((item) => item.status === status);
  return { data: filtered };
}

interface Match {
  status: number;
  data: any;
}

/** Resolve a mock response for a request. Returns null if genuinely no route matched (falls back to empty list / success envelope). */
export function resolveMock(config: InternalAxiosRequestConfig): Match {
  const method = (config.method ?? 'get').toLowerCase();
  const fullUrl = config.url ?? '';
  const pathname = fullUrl.split('?')[0];
  const body = parseBody(config.data);
  const seg = pathname.split('/').filter(Boolean); // e.g. ['guests', 'abc123', 'face']

  const notFound = { status: 404, data: { error: 'Not found' } };

  // ---- Guests ----
  if (seg[0] === 'guests') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: paginated(mockGuests, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockGuests, body, 'guest') };
    }
    if (seg[1] === 'bulk' && method === 'delete') {
      const ids: string[] = body.ids ?? [];
      ids.forEach((id) => removeItemById(mockGuests, id));
      return { status: 200, data: { success: true, deleted: ids } };
    }
    if (seg[1] === 'bulk-import' && method === 'post') {
      const guests = body.guests ?? [];
      guests.forEach((g: any) => addItem(mockGuests, g, 'guest'));
      return { status: 200, data: { imported: guests.length, errors: [] } };
    }
    if (seg[1] === 'export' && method === 'get') return { status: 200, data: mockGuests };
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockGuests, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockGuests, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockGuests, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'face' && method === 'post') return { status: 200, data: { success: true } };
  }

  // ---- Customers ----
  if (seg[0] === 'customers') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: paginated(mockCustomers, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockCustomers, body, 'cust') };
    }
    if (seg[1] === 'export' && method === 'get') return { status: 200, data: mockCustomers };
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockCustomers, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockCustomers, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockCustomers, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'face' && method === 'post') return { status: 200, data: { success: true } };
  }

  // ---- Check-ins ----
  if (seg[0] === 'check-ins') {
    if (seg.length === 1 && method === 'get') return { status: 200, data: unwrapped(mockCheckIns, fullUrl) };
    if (seg.length === 1 && method === 'post') return { status: 201, data: addItem(mockCheckIns, body, 'checkin') };
    if (seg[1] === 'stats' && method === 'get') {
      return {
        status: 200,
        data: {
          expected: mockGuests.length,
          arrived: mockCheckIns.length,
          onSite: mockCheckIns.length,
          completed: Math.max(0, mockCheckIns.length - 2),
          noShows: 2,
          cancelled: 1,
        },
      };
    }
    if (seg[1] === 'quick' && method === 'post') return { status: 201, data: addItem(mockCheckIns, body, 'checkin') };
    if (seg[1] === 'qr' && method === 'post') return { status: 201, data: addItem(mockCheckIns, body, 'checkin') };
    if (seg[1] === 'facial-recognition' && method === 'post') {
      const guest = mockGuests[0];
      if (!guest) return { status: 404, data: { success: false, error: 'Face not recognized. Please register at the front desk first.' } };
      const checkin = addItem(mockCheckIns, {
        guestId: guest.id, guestName: guest.name, method: 'facial_recognition',
        checkInMethod: 'facial_recognition', venue: body.venue, status: 'arrived',
        timestamp: new Date().toISOString(),
      }, 'checkin');
      return {
        status: 200,
        data: {
          success: true, message: 'Face recognized successfully',
          guestId: guest.id, guestName: guest.name, matchConfidence: 97.5, checkin,
        },
      };
    }
    if (seg[2] === 'badge' && method === 'post') return { status: 200, data: { printed: true } };
  }

  // ---- Events ----
  if (seg[0] === 'events') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockEvents, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockEvents, body, 'event') };
    }
    if (seg[1] === 'upcoming' && method === 'get') {
      const limit = Number(new URLSearchParams(fullUrl.split('?')[1] ?? '').get('limit') ?? 5);
      return { status: 200, data: mockEvents.slice(0, limit) };
    }
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockEvents, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockEvents, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockEvents, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'attendees' && method === 'get') return { status: 200, data: mockCheckIns.slice(0, 10) };
  }

  // ---- Venues ----
  if (seg[0] === 'venues') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockVenues, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockVenues, body, 'venue') };
    }
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockVenues, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockVenues, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockVenues, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'occupancy' && method === 'put') {
      const item = updateItemById(mockVenues, seg[1], { occupancy: body.occupancy });
      return item ? { status: 200, data: item } : notFound;
    }
  }

  // ---- Staff ----
  if (seg[0] === 'staff') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockStaff, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockStaff, body, 'staff') };
    }
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockStaff, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockStaff, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockStaff, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'schedule' && method === 'put') {
      const item = updateItemById(mockStaff, seg[1], { schedule: body.schedule });
      return item ? { status: 200, data: item } : notFound;
    }
  }

  // ---- Hospitality ----
  if (seg[0] === 'hospitality') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockHospitality, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockHospitality, body, 'hosp') };
    }
    if (seg[1] === 'vip-guests' && method === 'get') return { status: 200, data: mockHospitality.slice(0, 5) };
    if (seg[1] === 'guest' && method === 'get') return { status: 200, data: mockHospitality.filter((h) => h.guestId === seg[2]) };
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockHospitality, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockHospitality, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'status' && method === 'put') {
      updateItemById(mockHospitality, seg[1], { status: body.status });
      return { status: 200, data: { success: true } };
    }
  }

  // ---- Registrations ----
  if (seg[0] === 'registrations') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockRegistrations, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockRegistrations, body, 'reg') };
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockRegistrations, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockRegistrations, seg[1]);
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'confirm' && method === 'post') {
      updateItemById(mockRegistrations, seg[1], { status: 'confirmed' });
      return { status: 200, data: { success: true } };
    }
    if (seg[2] === 'payment' && method === 'post') {
      const pStatus = body.paymentStatus ?? body.status ?? 'paid';
      updateItemById(mockRegistrations, seg[1], { paymentStatus: pStatus });
      return { status: 200, data: { success: true, paymentStatus: pStatus } };
    }
  }

  // ---- Payments ----
  if (seg[0] === 'payments') {
    if (seg.length === 1 && method === 'get') {
      return {
        status: 200,
        data: {
          data: mockPayments,
          total: mockPayments.length,
          page: 1,
          limit: 20,
        },
      };
    }
    if (seg.length === 1 && method === 'post') {
      const created = {
        id: `pay_${Date.now()}`,
        registrationId: body.registrationId,
        amount: Number(body.amount ?? 0),
        currency: body.currency ?? 'INR',
        method: body.method ?? body.paymentMethod ?? 'credit_card',
        paymentMethod: body.paymentMethod ?? body.method ?? 'card',
        transactionId: body.transactionId,
        description: body.description,
        status: body.status ?? 'paid',
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      (mockPayments as any[]).unshift(created);
      return { status: 201, data: created };
    }
    if (seg[2] === 'refund' && method === 'post') {
      return { status: 200, data: { id: seg[1], status: 'refunded', refundAmount: Number(body.amount ?? 0) } };
    }
    if (seg[2] === 'status' && method === 'put') {
      return { status: 200, data: { id: seg[1], status: body.status } };
    }
    if (seg[1] === 'stats' && method === 'get') {
      return {
        status: 200,
        data: {
          totalPayments: 12,
          successfulPayments: 10,
          pendingPayments: 1,
          failedPayments: 1,
          refundedPayments: 1,
          totalAmount: 15400,
          refundedAmount: 500,
          netAmount: 14900,
        },
      };
    }
  }

  // ---- Notifications ----
  if (seg[0] === 'notifications') {
    if (seg.length === 1 && method === 'get') return { status: 200, data: unwrapped(mockNotifications, fullUrl) };
    if (seg[2] === 'read' && method === 'put') {
      updateItemById(mockNotifications, seg[1], { read: true } as any);
      return { status: 200, data: { success: true } };
    }
    if (seg[1] === 'read-all' && method === 'put') {
      mockNotifications.forEach((n) => (n.read = true));
      return { status: 200, data: { success: true } };
    }
    if (seg[1] === 'all' && method === 'delete') {
      mockNotifications.length = 0;
      return { status: 200, data: { success: true } };
    }
  }

  // ---- Resellers / Companies ----
  if (seg[0] === 'resellers') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockResellers, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockResellers, { status: 'active', ...body }, 'resell') };
    }
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockResellers, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockResellers, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockResellers, seg[1]);
      return { status: 200, data: { success: true } };
    }
  }
  if (seg[0] === 'companies') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockCompanies, fullUrl) };
      if (method === 'post') {
        // Mirrors the real backend: tenant_id is always server-generated, never client-supplied.
        const created = addItem(mockCompanies, { status: 'active', ...body }, 'co');
        (created as any).tenant_id = `tenant-${created.id}`;
        return { status: 201, data: created };
      }
    }
    if (seg.length === 2 && method === 'get') {
      const item = findById(mockCompanies, seg[1]);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'put') {
      const item = updateItemById(mockCompanies, seg[1], body);
      return item ? { status: 200, data: item } : notFound;
    }
    if (seg.length === 2 && method === 'delete') {
      removeItemById(mockCompanies, seg[1]);
      return { status: 200, data: { success: true } };
    }
  }

  // ---- Appointments / Calendar / Services ----
  if (seg[0] === 'appointments') {
    if (seg.length === 1) {
      if (method === 'get') return { status: 200, data: unwrapped(mockAppointments, fullUrl) };
      if (method === 'post') return { status: 201, data: addItem(mockAppointments, body, 'appt') };
    }
    if (seg[2] === 'status' && method === 'put') {
      const item = updateItemById(mockAppointments, seg[1], { status: body.status });
      return item ? { status: 200, data: item } : notFound;
    }
  }
  if (seg[0] === 'calendar') {
    if (seg[1] === 'events' && method === 'get') {
      return { status: 200, data: { month: new Date().toISOString().slice(0, 7), entries: mockAppointments.map((a) => ({ id: a.id, title: a.title, date: a.date, type: 'appointment', status: a.status })) } };
    }
    if (seg.length === 1 && method === 'get') {
      return {
        status: 200,
        data: {
          date: new Date().toISOString().slice(0, 10),
          staffColumns: mockStaff.slice(0, 4).map((s) => ({
            staff: { id: s.id, name: s.name, shortName: s.name.split(' ').map((p: string) => p[0]).join(''), rooms: 'Room 1' },
            appointments: mockAppointments.filter((a) => a.staffId === s.id),
          })),
        },
      };
    }
  }
  if (seg[0] === 'services' && method === 'get') {
    return { status: 200, data: [{ id: uid_services(1), name: 'Consultation', duration: 30 }, { id: uid_services(2), name: 'Full Session', duration: 60 }] };
  }

  // ---- Dashboard / Reports ----
  if (seg[0] === 'dashboard') {
    if (seg[1] === 'activity' && method === 'get') return { status: 200, data: mockActivityFeed() };
    if (seg[1] === 'charts' && method === 'get') return { status: 200, data: mockChartData(seg[2] ?? '') };
  }
  if (seg[0] === 'reports') {
    if (seg[1] === 'dashboard-stats' && method === 'get') return { status: 200, data: mockDashboardStats() };
    if (seg[1] === 'daily' && method === 'get') {
      const days = Number(new URLSearchParams(fullUrl.split('?')[1] ?? '').get('days') ?? 7);
      return { status: 200, data: { data: mockDailyReports(days) } };
    }
    if (seg[1] === 'guest-arrivals' && method === 'get') return { status: 200, data: { data: mockChartData('guest-arrivals') } };
    if (seg[1] === 'monthly-events' && method === 'get') return { status: 200, data: { data: mockChartData('monthly-events') } };
    if (seg[1] === 'revenue-trend' && method === 'get') return { status: 200, data: { data: mockChartData('revenue-trend') } };
    if (seg[1] === 'export' && method === 'post') return { status: 200, data: { downloadUrl: '#' } };
  }

  // ---- Settings ----
  if (seg[0] === 'settings') {
    if (seg[1] === 'profile') {
      if (method === 'get') return { status: 200, data: { id: 'local-user', name: 'Rahul', email: 'you@example.com', role: 'admin' } };
      if (method === 'put') return { status: 200, data: { id: 'local-user', ...body } };
    }
    if (seg[1] === 'organisation') {
      if (method === 'get') return { status: 200, data: mockSettings.organization };
      if (method === 'put') return { status: 200, data: { ...mockSettings.organization, ...body } };
    }
    if (seg[1] === 'notifications' && method === 'put') return { status: 200, data: { ...mockSettings.notifications, ...body } };
    if (seg[1] === 'password' && method === 'put') return { status: 200, data: { message: 'Password updated' } };
  }

  // ---- Uploads ----
  if (seg[0] === 'uploads' && seg[1] === 'presigned-url' && method === 'post') {
    return { status: 200, data: { uploadUrl: '#', fileUrl: '#', objectKey: 'mock-key' } };
  }

  // ---- Fallback: never fail. Empty-but-valid shape for GET, echo for writes. ----
  if (method === 'get') return { status: 200, data: { data: [] } };
  if (method === 'delete') return { status: 200, data: { success: true } };
  return { status: 200, data: { success: true, ...body, id: body.id ?? `mock_${Date.now()}` } };
}

let servicesCounter = 0;
function uid_services(n: number) {
  servicesCounter += 1;
  return `service_${n}_${servicesCounter}`;
}

export function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const { status, data } = resolveMock(config);
  const response: AxiosResponse = {
    data,
    status,
    statusText: status < 400 ? 'OK' : 'Error',
    headers: {},
    config: config as any,
    request: {},
  };
  const delay = 150 + Math.random() * 250;
  if (status >= 400) {
    return new Promise((_resolve, reject) =>
      setTimeout(() => reject(Object.assign(new Error('Mock request failed'), { response })), delay)
    );
  }
  return new Promise((resolve) => setTimeout(() => resolve(response), delay));
}
