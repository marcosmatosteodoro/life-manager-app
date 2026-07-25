export type ExpenseType = 'debito' | 'credito' | 'a_vista' | 'pix';

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface ExpenseCategoryListResponse {
  count: number;
  rows: ExpenseCategory[];
}

export interface Expense {
  id: number;
  title: string;
  value: number;
  type: ExpenseType;
  installments: number | null;
  date: string;
  categoryId: number | null;
  category?: ExpenseCategory | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
  /** Se tem descrição em áudio (blob vem sob demanda). */
  hasAudio?: boolean;
}

export interface ExpenseInput {
  title: string;
  value: number;
  type: ExpenseType;
  installments?: number | null;
  date: string;
  /** Texto do combobox de categoria; vazio = sem categoria. */
  categoryName?: string;
  description?: string | null;
}

export interface ExpenseListResponse {
  count: number;
  rows: Expense[];
}

/** Áudio (base64 + mimeType) sob demanda. */
export interface ExpenseAudio {
  data: string;
  mimeType: string;
}

export interface ExpenseSummaryCategory {
  categoryId: number | null;
  name: string;
  total: number;
}

export interface ExpenseSummary {
  month: string;
  monthTotal: number;
  count: number;
  byCategory: ExpenseSummaryCategory[];
}
