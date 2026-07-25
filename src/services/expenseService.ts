import { apiRequest } from './http';
import type {
  Expense,
  ExpenseAudio,
  ExpenseCategoryListResponse,
  ExpenseInput,
  ExpenseListResponse,
  ExpenseSummary,
  ExpenseType,
} from './expense.types';

export { ApiError } from './http';

/** Ordem dos tipos para o select (rótulos via i18n `expenses:type.<value>`). */
export const EXPENSE_TYPES: ExpenseType[] = ['debito', 'credito', 'a_vista', 'pix'];

export const expenseService = {
  list(): Promise<ExpenseListResponse> {
    return apiRequest<ExpenseListResponse>('/expense');
  },
  summary(): Promise<ExpenseSummary> {
    return apiRequest<ExpenseSummary>('/expense/summary');
  },
  create(input: ExpenseInput): Promise<Expense> {
    return apiRequest<Expense>('/expense', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: ExpenseInput): Promise<Expense> {
    return apiRequest<Expense>(`/expense/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/expense/${id}`, { method: 'DELETE' });
  },
  getAudio(id: number): Promise<ExpenseAudio> {
    return apiRequest<ExpenseAudio>(`/expense/${id}/audio`);
  },
  setAudio(id: number, input: ExpenseAudio): Promise<ExpenseAudio> {
    return apiRequest<ExpenseAudio>(`/expense/${id}/audio`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  removeAudio(id: number): Promise<void> {
    return apiRequest<void>(`/expense/${id}/audio`, { method: 'DELETE' });
  },
};

export const expenseCategoryService = {
  list(): Promise<ExpenseCategoryListResponse> {
    return apiRequest<ExpenseCategoryListResponse>('/expense-category');
  },
};
