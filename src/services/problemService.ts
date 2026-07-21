import { apiRequest } from './http';
import type {
  Problem,
  ProblemInput,
  ProblemListResponse,
  ProblemStatus,
} from './problem.types';

export { ApiError } from './http';

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
