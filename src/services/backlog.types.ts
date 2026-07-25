export type BacklogStatus = 'pendente' | 'concluido';

/** Item do backlog do sistema ("próximos passos"). */
export interface BacklogItem {
  id: number;
  name: string;
  position: number | null;
  description: string | null;
  status: BacklogStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
  /** Indica se o item tem nota de voz (o blob vem sob demanda). */
  hasAudio?: boolean;
}

/** Nota de voz (base64 + mimeType) retornada sob demanda. */
export interface BacklogAudio {
  data: string;
  mimeType: string;
}

export interface CreateBacklogItemInput {
  name: string;
  description?: string;
}

export interface UpdateBacklogItemInput {
  name?: string;
  description?: string;
}

export interface BacklogListResponse {
  count: number;
  rows: BacklogItem[];
}
