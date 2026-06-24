/** Status do artigo — calculado pelo back, somente leitura no front. */
export type ArticleStatus =
  | 'READING_IN_PROGRESS'
  | 'SUMMARY_IN_PROGRESS'
  | 'APPLYING_CORRECTION'
  | 'COMPLETED';

/** Artigo (estudo de inglês) retornado pela API. */
export interface Article {
  id: number;
  title: string;
  link: string | null;
  readingTime: number;
  timeRead: number | null;
  timeWrite: number | null;
  summary: string | null;
  summaryCorrected: string | null;
  score: number | null;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

/**
 * Payload de criação/edição (edição é parcial).
 * `status` NÃO é enviado — quem define é o back.
 */
export interface ArticleInput {
  title: string;
  link?: string | null;
  readingTime: number;
  timeRead?: number | null;
  timeWrite?: number | null;
  summary?: string | null;
  summaryCorrected?: string | null;
  score?: number | null;
}

/** Resposta da listagem. */
export interface ArticleListResponse {
  count: number;
  rows: Article[];
}

/** Rótulos PT-BR para o status (exibição no front). */
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  READING_IN_PROGRESS: 'Leitura em progresso',
  SUMMARY_IN_PROGRESS: 'Resumo em progresso',
  APPLYING_CORRECTION: 'Aplicando correção',
  COMPLETED: 'Concluído',
};
