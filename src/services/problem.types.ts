export type ProblemStatus = 'pendente' | 'em_progresso' | 'concluido';

/** Categoria de um problema (nome + cor da tag). */
export interface ProblemCategory {
  id: number;
  name: string;
  color: string;
}

export interface ProblemCategoryInput {
  name: string;
  color: string;
}

export interface ProblemCategoryListResponse {
  count: number;
  rows: ProblemCategory[];
}

/** Problema a ser resolvido (título, descrição, status, ordem e categoria). */
export interface Problem {
  id: number;
  title: string;
  position: number;
  description: string | null;
  status: ProblemStatus;
  categoryId: number | null;
  category?: ProblemCategory | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface ProblemInput {
  title: string;
  description?: string | null;
  status: ProblemStatus;
  categoryId: number | null;
}

export interface ProblemListResponse {
  count: number;
  rows: Problem[];
}
