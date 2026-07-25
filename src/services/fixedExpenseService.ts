import { apiRequest } from './http';
import type {
  FixedExpense,
  FixedExpenseInput,
  FixedExpenseListResponse,
} from './fixedExpense.types';

export { ApiError } from './http';

export const fixedExpenseService = {
  list(): Promise<FixedExpenseListResponse> {
    return apiRequest<FixedExpenseListResponse>('/fixed-expense');
  },
  create(input: FixedExpenseInput): Promise<FixedExpense> {
    return apiRequest<FixedExpense>('/fixed-expense', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: FixedExpenseInput): Promise<FixedExpense> {
    return apiRequest<FixedExpense>(`/fixed-expense/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/fixed-expense/${id}`, { method: 'DELETE' });
  },
};
