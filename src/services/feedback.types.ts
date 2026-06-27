/** Período coberto por um feedback (espelha o enum do back). */
export type FeedbackPeriod = '7d' | '15d' | '30d' | '60d' | '1y' | 'all';

/** Feedback retornado pela API. */
export interface Feedback {
  id: number;
  period: FeedbackPeriod;
  periodStart: string | null;
  periodEnd: string;
  /** Dados agregados enviados ao modelo (JSON serializado). */
  inputData: string;
  /** Prompt completo enviado. */
  prompt: string;
  /** Feedback retornado pelo modelo (HTML). */
  response: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface FeedbackListResponse {
  count: number;
  rows: Feedback[];
}

/** Opções de período com rótulos pt-BR (para o seletor e exibição). */
export const FEEDBACK_PERIOD_OPTIONS: { value: FeedbackPeriod; label: string }[] =
  [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '15d', label: 'Últimos 15 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '60d', label: 'Últimos 60 dias' },
    { value: '1y', label: 'Último ano' },
    { value: 'all', label: 'Desde o começo' },
  ];
