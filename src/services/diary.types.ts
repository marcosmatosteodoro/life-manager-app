export type DiaryType = 'DAILY' | 'GRATITUDE';

/** Registro de diário retornado pela API. */
export interface Diary {
  id: number;
  day: string; // YYYY-MM-DD
  description: string;
  type: DiaryType;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface DiaryInput {
  day: string;
  description: string;
  type: DiaryType;
}

export interface DiaryListResponse {
  count: number;
  rows: Diary[];
}
