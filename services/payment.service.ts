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

export const paymentService = {
  async getPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    const params = buildParams({ limit: 20, ...filters });
    const { data } = await api.get<PaymentListResponse>(`${API_ENDPOINTS.PAYMENTS}?${params}`);
    return data;
  },

  async getPayment(id: string): Promise<Payment> {
    const { data } = await api.get<Payment>(`${API_ENDPOINTS.PAYMENTS}/${id}`);
    return data;
  },

  async createPayment(input: CreatePaymentPayload): Promise<Payment> {
    const payload = {
      ...input,
      amount: Number(input.amount),
      method: input.method ?? (input.paymentMethod === 'card' ? 'credit_card' : input.paymentMethod) ?? 'credit_card',
      paymentMethod: input.paymentMethod ?? (input.method === 'credit_card' ? 'card' : (input.method as PaymentMethodType)) ?? 'card',
      status: input.status ?? 'paid',
    };
    const { data } = await api.post<Payment>(API_ENDPOINTS.PAYMENTS, payload);
    return data;
  },

  async updatePayment(id: string, input: UpdatePaymentPayload): Promise<Payment> {
    const { data } = await api.put<Payment>(`${API_ENDPOINTS.PAYMENTS}/${id}`, input);
    return data;
  },

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const { data } = await api.put<Payment>(`${API_ENDPOINTS.PAYMENTS}/${id}/status`, { status });
    return data;
  },

  async refundPayment(id: string, input: RefundPaymentPayload): Promise<Payment> {
    const { data } = await api.post<Payment>(`${API_ENDPOINTS.PAYMENTS}/${id}/refund`, input);
    return data;
  },

  async getPaymentStats(): Promise<PaymentStats> {
    const { data } = await api.get<PaymentStats>(`${API_ENDPOINTS.PAYMENTS}/stats`);
    return data;
  },

  async exportPayments(): Promise<Payment[]> {
    const { data } = await api.get(`${API_ENDPOINTS.PAYMENTS}/export`);
    return Array.isArray(data) ? data : [];
  },
};
