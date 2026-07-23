import { apiRequest } from './http';
import type {
  Problem,
  ProblemCategory,
  ProblemCategoryInput,
  ProblemCategoryListResponse,
  ProblemInput,
  ProblemListResponse,
  ProblemPriority,
  ProblemStatus,
} from './problem.types';

export { ApiError } from './http';

export const problemCategoryService = {
  list(): Promise<ProblemCategoryListResponse> {
    return apiRequest<ProblemCategoryListResponse>('/problem-category');
  },

  create(input: ProblemCategoryInput): Promise<ProblemCategory> {
    return apiRequest<ProblemCategory>('/problem-category', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: ProblemCategoryInput): Promise<ProblemCategory> {
    return apiRequest<ProblemCategory>(`/problem-category/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/problem-category/${id}`, { method: 'DELETE' });
  },
};

export const problemService = {
  list(status?: ProblemStatus): Promise<ProblemListResponse> {
    const qs = status ? `?status=${status}` : '';
    return apiRequest<ProblemListResponse>(`/problem${qs}`);
  },

  create(input: ProblemInput): Promise<Problem> {
    return apiRequest<Problem>('/problem', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: ProblemInput): Promise<Problem> {
    return apiRequest<Problem>(`/problem/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/problem/${id}`, { method: 'DELETE' });
  },

  /** Reordena todos os problemas (position = índice + 1). */
  reorder(orderedIds: number[]): Promise<ProblemListResponse> {
    return apiRequest<ProblemListResponse>('/problem/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  },
};

/**
 * Ordem dos status para selects/filtros. Rótulos são traduzidos no front
 * (i18n, namespace `problems` → `status.<VALUE>`).
 */
export const PROBLEM_STATUSES: ProblemStatus[] = [
  'pendente',
  'em_progresso',
  'concluido',
];

/** Ordem das prioridades para selects/filtros (rótulos via i18n `priority.<VALUE>`). */
export const PROBLEM_PRIORITIES: ProblemPriority[] = [
  'baixa',
  'media',
  'alta',
  'urgente',
];
