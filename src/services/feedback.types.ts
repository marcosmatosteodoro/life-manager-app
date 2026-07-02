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

/** Opções de período com chaves i18n (para o seletor e exibição). */
export const FEEDBACK_PERIOD_OPTIONS: {
  value: FeedbackPeriod;
  labelKey: string;
}[] = [
  { value: '7d', labelKey: 'period.d7' },
  { value: '15d', labelKey: 'period.d15' },
  { value: '30d', labelKey: 'period.d30' },
  { value: '60d', labelKey: 'period.d60' },
  { value: '1y', labelKey: 'period.y1' },
  { value: 'all', labelKey: 'period.all' },
];
