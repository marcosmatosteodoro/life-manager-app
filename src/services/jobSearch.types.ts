/** Provedores de busca de vagas (espelha o back). */
export type JobProvider = 'adzuna' | 'jsearch';

/** Janela de tempo da busca. */
export type JobSearchPeriod = 'today' | '3d' | '7d' | '1m';

/** Uma vaga retornada pelo buscador. */
export interface JobRow {
  source: JobProvider;
  title: string;
  company: string | null;
  location: string | null;
  countryCode: string;
  remote: boolean | null;
  url: string;
  description: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  postedAt: string | null;
  score: number;
  matchedKeywords: string[];
  hiresInternational: boolean;
}

export interface JobSearchResponse {
  count: number;
  rows: JobRow[];
}

/** Parâmetros aceitos pelo buscador. */
export interface JobSearchParams {
  providers?: JobProvider[];
  period?: JobSearchPeriod;
  countryId?: number;
}

export const JOB_PROVIDER_OPTIONS: { value: JobProvider; label: string }[] = [
  { value: 'adzuna', label: 'Adzuna' },
  { value: 'jsearch', label: 'JSearch' },
];

export const JOB_PERIOD_OPTIONS: { value: JobSearchPeriod; labelKey: string }[] =
  [
    { value: 'today', labelKey: 'period.today' },
    { value: '3d', labelKey: 'period.d3' },
    { value: '7d', labelKey: 'period.d7' },
    { value: '1m', labelKey: 'period.m1' },
  ];
