export type ProblemStatus = 'pendente' | 'em_progresso' | 'concluido';

/** Problema a ser resolvido (título, descrição, status e ordem manual). */
export interface Problem {
  id: number;
  title: string;
  position: number;
  description: string | null;
  status: ProblemStatus;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface ProblemInput {
  title: string;
  description?: string | null;
  status: ProblemStatus;
}

export interface ProblemListResponse {
  count: number;
  rows: Problem[];
}
