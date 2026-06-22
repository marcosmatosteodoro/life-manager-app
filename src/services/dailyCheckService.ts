import { apiRequest } from './http';
import type {
  DailyCheck,
  DailyCheckInput,
  DailyCheckListResponse,
} from './dailyCheck.types';

export { ApiError } from './http';

export const dailyCheckService = {
  list(): Promise<DailyCheckListResponse> {
    return apiRequest<DailyCheckListResponse>('/daily-check');
  },

  /** Retorna o check de hoje (cria automaticamente no backend se não existir). */
  today(): Promise<DailyCheck> {
    return apiRequest<DailyCheck>('/daily-check/today');
  },

  update(id: number, input: DailyCheckInput): Promise<DailyCheck> {
    return apiRequest<DailyCheck>(`/daily-check/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
