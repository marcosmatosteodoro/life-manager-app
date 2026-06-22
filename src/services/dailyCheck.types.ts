/** Check diário retornado pela API. */
export interface DailyCheck {
  id: number;
  readingSkills: boolean;
  writingSkills: boolean;
  listeningSkills: boolean;
  speakingSkills: boolean;
  applyJobs: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

/** Campos booleanos que podem receber check. */
export type DailyCheckSkill =
  | 'readingSkills'
  | 'writingSkills'
  | 'listeningSkills'
  | 'speakingSkills'
  | 'applyJobs';

/** Payload de atualização (parcial). */
export type DailyCheckInput = Partial<Record<DailyCheckSkill, boolean>>;

/** Resposta da listagem. */
export interface DailyCheckListResponse {
  count: number;
  rows: DailyCheck[];
}
