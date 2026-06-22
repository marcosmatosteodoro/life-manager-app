import { apiRequest } from './http';
import type {
  Country,
  CountryInput,
  CountryListResponse,
} from './country.types';

export { ApiError } from './http';

export const countryService = {
  list(): Promise<CountryListResponse> {
    return apiRequest<CountryListResponse>('/country');
  },

  create(input: CountryInput): Promise<Country> {
    return apiRequest<Country>('/country', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: CountryInput): Promise<Country> {
    return apiRequest<Country>(`/country/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/country/${id}`, { method: 'DELETE' });
  },
};
