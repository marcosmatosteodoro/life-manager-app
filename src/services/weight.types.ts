/** Registro de peso retornado pela API. */
export interface Weight {
  id: number;
  value: number;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

/** Payload de criação/edição (mesmo formato, edição é parcial). */
export interface WeightInput {
  value: number;
  date: string;
  time?: string | null;
}

/** Resposta da listagem. */
export interface WeightListResponse {
  count: number;
  rows: Weight[];
}
