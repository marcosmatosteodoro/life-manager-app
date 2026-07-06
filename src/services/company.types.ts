import type { Country } from './country.types';

/** Empresa retornada pela API (com país embutido nas leituras). */
export interface Company {
  id: number;
  name: string;
  website: string;
  countryId: number;
  /** Anotações livres sobre a empresa. */
  observation: string | null;
  country?: Country;
  /** Quantidade de candidaturas da empresa (presente nas leituras de listagem). */
  applyCount?: number;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface CompanyInput {
  name: string;
  website: string;
  countryId: number;
  observation?: string | null;
}

export interface CompanyListResponse {
  count: number;
  rows: Company[];
}
