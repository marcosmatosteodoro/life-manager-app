import { apiRequest } from './http';
import type { Apply, ApplyInput, ApplyListResponse } from './apply.types';

export { ApiError } from './http';

export const applyService = {
  list(): Promise<ApplyListResponse> {
    return apiRequest<ApplyListResponse>('/apply');
  },

  create(input: ApplyInput): Promise<Apply> {
    return apiRequest<Apply>('/apply', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: ApplyInput): Promise<Apply> {
    return apiRequest<Apply>(`/apply/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/apply/${id}`, { method: 'DELETE' });
  },
};

type ApplyStatusKey = NonNullable<ApplyInput['status']>;

/**
 * Ordem dos status para os selects. Os rótulos são traduzidos no front
 * (i18n, namespace `jobs` → `applyStatus.<VALUE>`).
 */
export const APPLY_STATUSES: ApplyStatusKey[] = [
  'APPLIED',
  'REJECTED',
  'IGNORED',
  'INTERVIEW_SCHEDULED',
  'TECHNICAL_TEST',
  'AWAITING_RESPONSE',
  'APPROVED',
];
