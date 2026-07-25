export type ProblemStatus = 'pendente' | 'em_progresso' | 'concluido';
export type ProblemPriority = 'baixa' | 'media' | 'alta' | 'urgente';

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
  priority: ProblemPriority;
  categoryId: number | null;
  category?: ProblemCategory | null;
  /** Tem nota de voz? (o áudio vem sob demanda em GET /problem/:id/audio). */
  hasAudio?: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

/** Nota de voz de um problema (base64 + mimeType). */
export interface ProblemAudio {
  data: string;
  mimeType: string;
}

export interface ProblemInput {
  title: string;
  description?: string | null;
  status: ProblemStatus;
  priority: ProblemPriority;
  categoryId: number | null;
}

export interface ProblemListResponse {
  count: number;
  rows: Problem[];
}
