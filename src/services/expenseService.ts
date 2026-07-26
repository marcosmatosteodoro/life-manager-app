import { apiRequest } from './http';
import type {
  Expense,
  ExpenseAnalysis,
  ExpenseAudio,
  ExpenseCategoryListResponse,
  ExpenseInput,
  ExpenseListResponse,
  ExpensePageResponse,
  ExpensePhoto,
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
  /** Dados agregados da página (lista + categorias + resumo) em 1 requisição. */
  page(): Promise<ExpensePageResponse> {
    return apiRequest<ExpensePageResponse>('/expense/page');
  },
  summary(): Promise<ExpenseSummary> {
    return apiRequest<ExpenseSummary>('/expense/summary');
  },
  /** Análise dos gastos do período via IA (chamada paga no back). */
  analyze(from: string, to: string): Promise<ExpenseAnalysis> {
    return apiRequest<ExpenseAnalysis>('/expense/analysis', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    });
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
  listPhotos(id: number): Promise<ExpensePhoto[]> {
    return apiRequest<ExpensePhoto[]>(`/expense/${id}/photos`);
  },
  addPhoto(
    id: number,
    input: { data: string; mimeType: string },
  ): Promise<ExpensePhoto> {
    return apiRequest<ExpensePhoto>(`/expense/${id}/photos`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  removePhoto(id: number, photoId: number): Promise<void> {
    return apiRequest<void>(`/expense/${id}/photos/${photoId}`, {
      method: 'DELETE',
    });
  },
};

export const expenseCategoryService = {
  list(): Promise<ExpenseCategoryListResponse> {
    return apiRequest<ExpenseCategoryListResponse>('/expense-category');
  },
};
