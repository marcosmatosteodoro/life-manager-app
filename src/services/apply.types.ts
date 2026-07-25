import type { Company } from './company.types';

export type ApplyStatus =
  | 'APPLIED'
  | 'REJECTED'
  | 'IGNORED'
  | 'INTERVIEW_SCHEDULED'
  | 'TECHNICAL_TEST'
  | 'AWAITING_RESPONSE'
  | 'APPROVED';

/** Conselho da extensão: 1 não aplique → 2 avaliar você mesmo → 3 aplique → 4 ótimo match. */
export type AdviceStatus = 1 | 2 | 3 | 4;
export const ADVICE_STATUSES: AdviceStatus[] = [1, 2, 3, 4];

/** Candidatura retornada pela API (com empresa embutida nas leituras). */
export interface Apply {
  id: number;
  name: string;
  link: string | null;
  date: string;
  status: ApplyStatus;
  description: string | null;
  /** Criado por humano (app) ou robô (extensão). */
  isHuman: boolean;
  /** Conselho da extensão (1-4) ou null. */
  adviceStatus: AdviceStatus | null;
  /** Motivo/decisão (por que apliquei ou não), opcional. */
  decisionDescription: string | null;
  companyId: number;
  company?: Company;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface ApplyInput {
  name: string;
  date: string;
  status: ApplyStatus;
  companyId: number;
  link?: string | null;
  description?: string | null;
  isHuman?: boolean;
  adviceStatus?: AdviceStatus | null;
  decisionDescription?: string | null;
}

export interface ApplyListResponse {
  count: number;
  rows: Apply[];
}
