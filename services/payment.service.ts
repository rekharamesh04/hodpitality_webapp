import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Payment, PaymentStats, PaymentStatus, PaymentMethodType } from '@/types';

export interface PaymentFilters {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethodType;
  registrationId?: string;
  customerId?: string;
  guestId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePaymentPayload {
  amount: number;
  method?: string;
  paymentMethod?: PaymentMethodType;
  status?: PaymentStatus;
  currency?: string;
  registrationId?: string;
  customerId?: string;
  guestId?: string;
  transactionId?: string;
  description?: string;
}

export interface UpdatePaymentPayload {
  paymentMethod?: PaymentMethodType;
  description?: string;
}

export interface RefundPaymentPayload {
  amount: number;
  reason?: string;
}

function buildParams(filters: PaymentFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.status) p.set('status', filters.status);
  if (filters.paymentMethod) p.set('paymentMethod', filters.paymentMethod);
  if (filters.registrationId) p.set('registrationId', filters.registrationId);
  if (filters.customerId) p.set('customerId', filters.customerId);
  if (filters.guestId) p.set('guestId', filters.guestId);
  if (filters.search) p.set('search', filters.search);
  if (filters.dateFrom) p.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) p.set('dateTo', filters.dateTo);
  if (filters.page) p.set('page', String(filters.page));
  if (filters.limit) p.set('limit', String(filters.limit));
  return p;
}

function normalizePayment(raw: any): Payment {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw.id ?? (raw.PK ? String(raw.PK).replace('PAYMENT#', '') : '') ?? `pay_${Math.random().toString(36).slice(2, 9)}`;
  const method = raw.method ?? raw.paymentMethod ?? raw.payment_method ?? 'credit_card';
  const rawMethod = raw.paymentMethod ?? raw.method ?? raw.payment_method;
  const paymentMethod = (rawMethod === 'credit_card' ? 'card' : rawMethod ?? 'card') as PaymentMethodType;
  const amount = Number(raw.amount ?? raw.total ?? 0);
  const status = (raw.status ?? raw.paymentStatus ?? raw.payment_status ?? 'paid') as PaymentStatus;
  const currency = raw.currency ?? 'INR';
  const paidAt = raw.paidAt ?? raw.paid_at ?? raw.createdAt ?? raw.created_at ?? raw.timestamp;

  return {
    ...raw,
    id: String(id),
    amount: Number.isFinite(amount) ? amount : 0,
    currency: String(currency).toUpperCase(),
    status,
    method,
    paymentMethod,
    paidAt,
    registrationId: raw.registrationId ?? raw.registration_id ?? raw.regId,
    transactionId: raw.transactionId ?? raw.transaction_id ?? raw.txnId,
    description: raw.description ?? raw.notes ?? raw.reason,
    recordedBy: raw.recordedBy ?? raw.recorded_by ?? raw.created_by,
    refundAmount: raw.refundAmount != null ? Number(raw.refundAmount) : (raw.refund_amount != null ? Number(raw.refund_amount) : undefined),
    createdAt: raw.createdAt ?? raw.created_at ?? paidAt,
    created_at: raw.created_at ?? raw.createdAt ?? paidAt,
  };
}

function normalizePaymentList(raw: unknown): PaymentListResponse {
  if (!raw) {
    return { data: [], total: 0, page: 1, limit: 20 };
  }
  let items: any[] = [];
  let total = 0;
  let page = 1;
  let limit = 20;

  if (Array.isArray(raw)) {
    items = raw;
    total = raw.length;
  } else if (typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) {
      items = r.data;
    } else if (Array.isArray(r.items)) {
      items = r.items;
    } else if (Array.isArray(r.payments)) {
      items = r.payments;
    } else if (Array.isArray(r.entries)) {
      items = r.entries;
    } else if (r.data && typeof r.data === 'object') {
      const inner = r.data as Record<string, unknown>;
      if (Array.isArray(inner.items)) items = inner.items;
      else if (Array.isArray(inner.payments)) items = inner.payments;
      else if (Array.isArray(inner.data)) items = inner.data;
    }
    total = typeof r.total === 'number' ? r.total : (typeof r.count === 'number' ? r.count : items.length);
    page = typeof r.page === 'number' ? r.page : 1;
    limit = typeof r.limit === 'number' ? r.limit : 20;
  }

  const normalizedItems = items.map(normalizePayment);
  return {
    data: normalizedItems,
    total: total || normalizedItems.length,
    page,
    limit,
  };
}

function normalizePaymentStats(raw: unknown): PaymentStats {
  let statsObj: any = raw;
  if (raw && typeof raw === 'object') {
    if ('data' in (raw as any) && (raw as any).data && typeof (raw as any).data === 'object' && !Array.isArray((raw as any).data)) {
      statsObj = (raw as any).data;
    } else if ('stats' in (raw as any) && (raw as any).stats && typeof (raw as any).stats === 'object') {
      statsObj = (raw as any).stats;
    }
  }

  const totalPayments = statsObj?.totalPayments ?? statsObj?.total_payments ?? statsObj?.totalCount ?? statsObj?.count ?? statsObj?.total;
  const successfulPayments = statsObj?.successfulPayments ?? statsObj?.successful_payments ?? statsObj?.successful ?? statsObj?.paid;
  const pendingPayments = statsObj?.pendingPayments ?? statsObj?.pending_payments ?? statsObj?.pending;
  const failedPayments = statsObj?.failedPayments ?? statsObj?.failed_payments ?? statsObj?.failed;
  const refundedPayments = statsObj?.refundedPayments ?? statsObj?.refunded_payments ?? statsObj?.refunded;
  const totalAmount = statsObj?.totalAmount ?? statsObj?.total_amount ?? statsObj?.totalRevenue ?? statsObj?.revenue;
  const refundedAmount = statsObj?.refundedAmount ?? statsObj?.refunded_amount ?? statsObj?.refundedTotal;
  const netAmount = statsObj?.netAmount ?? statsObj?.net_amount ?? statsObj?.netRevenue;

  return {
    totalPayments: Number(totalPayments ?? 0) || 0,
    successfulPayments: Number(successfulPayments ?? 0) || 0,
    pendingPayments: Number(pendingPayments ?? 0) || 0,
    failedPayments: Number(failedPayments ?? 0) || 0,
    refundedPayments: Number(refundedPayments ?? 0) || 0,
    totalAmount: Number(totalAmount ?? 0) || 0,
    refundedAmount: Number(refundedAmount ?? 0) || 0,
    netAmount: Number(netAmount ?? (Number(totalAmount ?? 0) - Number(refundedAmount ?? 0))) || 0,
  };
}

export const paymentService = {
  async getPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    const params = buildParams({ limit: 50, ...filters });
    const { data } = await api.get<unknown>(`${API_ENDPOINTS.PAYMENTS}?${params}`);
    return normalizePaymentList(data);
  },

  async getPayment(id: string): Promise<Payment> {
    const { data } = await api.get<unknown>(`${API_ENDPOINTS.PAYMENTS}/${id}`);
    const item = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
    return normalizePayment(item);
  },

  async createPayment(input: CreatePaymentPayload): Promise<Payment> {
    const payload = {
      ...input,
      amount: Number(input.amount),
      method: input.method ?? (input.paymentMethod === 'card' ? 'credit_card' : input.paymentMethod) ?? 'credit_card',
      paymentMethod: input.paymentMethod ?? (input.method === 'credit_card' ? 'card' : (input.method as PaymentMethodType)) ?? 'card',
      status: input.status ?? 'paid',
    };
    const { data } = await api.post<unknown>(API_ENDPOINTS.PAYMENTS, payload);
    const item = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
    return normalizePayment(item);
  },

  async updatePayment(id: string, input: UpdatePaymentPayload): Promise<Payment> {
    const { data } = await api.put<unknown>(`${API_ENDPOINTS.PAYMENTS}/${id}`, input);
    const item = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
    return normalizePayment(item);
  },

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const { data } = await api.put<unknown>(`${API_ENDPOINTS.PAYMENTS}/${id}/status`, { status });
    const item = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
    return normalizePayment(item);
  },

  async refundPayment(id: string, input: RefundPaymentPayload): Promise<Payment> {
    const { data } = await api.post<unknown>(`${API_ENDPOINTS.PAYMENTS}/${id}/refund`, input);
    const item = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
    return normalizePayment(item);
  },

  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const { data } = await api.get<unknown>(`${API_ENDPOINTS.PAYMENTS}/stats`);
      return normalizePaymentStats(data);
    } catch {
      return normalizePaymentStats(null);
    }
  },

  async exportPayments(): Promise<Payment[]> {
    try {
      const { data } = await api.get<unknown>(`${API_ENDPOINTS.PAYMENTS}/export`);
      return normalizePaymentList(data).data;
    } catch {
      return [];
    }
  },
};
