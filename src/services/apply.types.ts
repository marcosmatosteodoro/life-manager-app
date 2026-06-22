import type { Company } from './company.types';

export type ApplyStatus =
  | 'APPLIED'
  | 'REJECTED'
  | 'IGNORED'
  | 'INTERVIEW_SCHEDULED'
  | 'TECHNICAL_TEST'
  | 'AWAITING_RESPONSE'
  | 'APPROVED';

/** Candidatura retornada pela API (com empresa embutida nas leituras). */
export interface Apply {
  id: number;
  name: string;
  link: string | null;
  date: string;
  status: ApplyStatus;
  description: string | null;
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
}

export interface ApplyListResponse {
  count: number;
  rows: Apply[];
}
