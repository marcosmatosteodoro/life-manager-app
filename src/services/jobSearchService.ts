import { apiRequest } from './http';
import type { JobSearchParams, JobSearchResponse } from './jobSearch.types';

export { ApiError } from './http';

export const jobSearchService = {
  /** Busca vagas remotas combinando os provedores escolhidos. */
  search(params: JobSearchParams = {}): Promise<JobSearchResponse> {
    const qs = new URLSearchParams();
    if (params.providers?.length) {
      qs.set('providers', params.providers.join(','));
    }
    if (params.period) qs.set('period', params.period);
    if (params.countryId != null) qs.set('countryId', String(params.countryId));
    const query = qs.toString();
    return apiRequest<JobSearchResponse>(
      `/job-search${query ? `?${query}` : ''}`,
    );
  },
};
