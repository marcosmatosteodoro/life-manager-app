import { apiRequest } from './http';
import type {
  Weight,
  WeightInput,
  WeightListResponse,
} from './weight.types';

// Reexporta para manter compatibilidade com quem importa daqui.
export { ApiError } from './http';

export const weightService = {
  list(): Promise<WeightListResponse> {
    return apiRequest<WeightListResponse>('/weight');
  },

  create(input: WeightInput): Promise<Weight> {
    return apiRequest<Weight>('/weight', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: WeightInput): Promise<Weight> {
    return apiRequest<Weight>(`/weight/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/weight/${id}`, { method: 'DELETE' });
  },
};
