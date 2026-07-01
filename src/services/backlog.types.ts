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
