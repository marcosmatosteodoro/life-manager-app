import type { Country } from './country.types';

/** Empresa retornada pela API (com país embutido nas leituras). */
export interface Company {
  id: number;
  name: string;
  website: string;
  countryId: number;
  country?: Country;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface CompanyInput {
  name: string;
  website: string;
  countryId: number;
}

export interface CompanyListResponse {
  count: number;
  rows: Company[];
}
