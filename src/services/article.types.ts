/** Artigo (estudo de inglês) retornado pela API. */
export interface Article {
  id: number;
  readingTime: number;
  timeRead: number;
  timeWrite: number | null;
  summary: string | null;
  summaryCorrected: string | null;
  score: number | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

/** Payload de criação/edição (edição é parcial). */
export interface ArticleInput {
  readingTime: number;
  timeRead: number;
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
