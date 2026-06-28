import { apiRequest } from './http';

export { ApiError } from './http';

/** Cotação retornada pelo backend (1 base = rate target). */
export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  date: string;
}

export const converterService = {
  /** Cotação de câmbio (ex.: USD→BRL). A fonte é cacheada no backend por 1h. */
  exchangeRate(base: string, target: string): Promise<ExchangeRate> {
    const qs = new URLSearchParams({ base, target }).toString();
    return apiRequest<ExchangeRate>(`/converter/exchange-rate?${qs}`);
  },
};
