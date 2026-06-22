import { apiRequest } from './http';
import type {
  Company,
  CompanyInput,
  CompanyListResponse,
} from './company.types';

export { ApiError } from './http';

export const companyService = {
  list(): Promise<CompanyListResponse> {
    return apiRequest<CompanyListResponse>('/company');
  },

  create(input: CompanyInput): Promise<Company> {
    return apiRequest<Company>('/company', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: CompanyInput): Promise<Company> {
    return apiRequest<Company>(`/company/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/company/${id}`, { method: 'DELETE' });
  },
};
