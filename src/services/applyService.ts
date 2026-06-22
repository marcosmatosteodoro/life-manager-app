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

/** Rótulos PT-BR para o enum de status. */
export const APPLY_STATUS_LABELS: Record<ApplyStatusKey, string> = {
  APPLIED: 'Aplicado',
  REJECTED: 'Rejeitado',
  IGNORED: 'Ignorado',
  INTERVIEW_SCHEDULED: 'Entrevista marcada',
  TECHNICAL_TEST: 'Fazendo teste técnico',
  AWAITING_RESPONSE: 'Aguardando retorno',
  APPROVED: 'Aprovado',
};

type ApplyStatusKey = NonNullable<ApplyInput['status']>;
