import { apiRequest } from './http';
import type {
  FlashCardGroup,
  FlashCardGroupInput,
  FlashCardGroupListResponse,
} from './flashCardGroup.types';

export { ApiError } from './http';

export const flashCardGroupService = {
  list(): Promise<FlashCardGroupListResponse> {
    return apiRequest<FlashCardGroupListResponse>('/flash-card-group');
  },

  create(input: FlashCardGroupInput): Promise<FlashCardGroup> {
    return apiRequest<FlashCardGroup>('/flash-card-group', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: FlashCardGroupInput): Promise<FlashCardGroup> {
    return apiRequest<FlashCardGroup>(`/flash-card-group/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/flash-card-group/${id}`, { method: 'DELETE' });
  },
};
