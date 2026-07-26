import { apiRequest } from './http';
import type {
  Debt,
  DebtInput,
  DebtListResponse,
  DebtPaymentInput,
} from './debt.types';

export { ApiError } from './http';

export const debtService = {
  list(): Promise<DebtListResponse> {
    return apiRequest<DebtListResponse>('/debt');
  },
  get(id: number): Promise<Debt> {
    return apiRequest<Debt>(`/debt/${id}`);
  },
  create(input: DebtInput): Promise<Debt> {
    return apiRequest<Debt>('/debt', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: DebtInput): Promise<Debt> {
    return apiRequest<Debt>(`/debt/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/debt/${id}`, { method: 'DELETE' });
  },
  addPayment(id: number, input: DebtPaymentInput): Promise<Debt> {
    return apiRequest<Debt>(`/debt/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  removePayment(id: number, paymentId: number): Promise<Debt> {
    return apiRequest<Debt>(`/debt/${id}/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },
};
