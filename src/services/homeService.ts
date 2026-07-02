import { apiRequest } from './http';
import type { Dashboard } from './home.types';

export { ApiError } from './http';

export const homeService = {
  /** Tudo que a Home precisa numa única requisição. */
  get(): Promise<Dashboard> {
    return apiRequest<Dashboard>('/home');
  },
};
