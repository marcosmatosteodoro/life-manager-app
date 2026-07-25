import { apiRequest } from './http';
import type {
  BacklogAudio,
  BacklogItem,
  BacklogListResponse,
  BacklogStatus,
  CreateBacklogItemInput,
  UpdateBacklogItemInput,
} from './backlog.types';

export { ApiError } from './http';

export const backlogService = {
  /** Lista os itens; `status` filtra (pendente por position, concluído por data). */
  list(status?: BacklogStatus): Promise<BacklogListResponse> {
    const qs = status ? `?status=${status}` : '';
    return apiRequest<BacklogListResponse>(`/backlog${qs}`);
  },

  create(input: CreateBacklogItemInput): Promise<BacklogItem> {
    return apiRequest<BacklogItem>('/backlog', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateBacklogItemInput): Promise<BacklogItem> {
    return apiRequest<BacklogItem>(`/backlog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  complete(id: number): Promise<BacklogItem> {
    return apiRequest<BacklogItem>(`/backlog/${id}/complete`, {
      method: 'PATCH',
    });
  },

  reopen(id: number): Promise<BacklogItem> {
    return apiRequest<BacklogItem>(`/backlog/${id}/reopen`, {
      method: 'PATCH',
    });
  },

  /** Reordena os pendentes (position = índice + 1). */
  reorder(orderedIds: number[]): Promise<BacklogListResponse> {
    return apiRequest<BacklogListResponse>('/backlog/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/backlog/${id}`, { method: 'DELETE' });
  },

  /** Busca a nota de voz do item (base64) sob demanda. */
  getAudio(id: number): Promise<BacklogAudio> {
    return apiRequest<BacklogAudio>(`/backlog/${id}/audio`);
  },

  /** Grava/atualiza a nota de voz do item. */
  setAudio(id: number, input: BacklogAudio): Promise<BacklogAudio> {
    return apiRequest<BacklogAudio>(`/backlog/${id}/audio`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  removeAudio(id: number): Promise<void> {
    return apiRequest<void>(`/backlog/${id}/audio`, { method: 'DELETE' });
  },
};
