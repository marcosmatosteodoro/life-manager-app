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
  /** Agrupa as parcelas de uma mesma compra (null = à vista). */
  parcelGroupId: string | null;
  /** Número desta parcela (1..installments), null se não parcelado. */
  parcelNumber: number | null;
  date: string;
  categoryId: number | null;
  category?: ExpenseCategory | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
  /** Se tem descrição em áudio (blob vem sob demanda). */
  hasAudio?: boolean;
  /** Quantidade de fotos (os blobs vêm sob demanda). */
  photoCount?: number;
}

/** Foto de um gasto (base64 + mimeType). */
export interface ExpensePhoto {
  id: number;
  data: string;
  mimeType: string;
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

/** Payload agregado da página de Gastos (lista + categorias + resumo). */
export interface ExpensePageResponse {
  expenses: Expense[];
  categories: ExpenseCategory[];
  summary: ExpenseSummary;
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

/** Análise de gastos por IA de um período. */
export interface ExpenseAnalysis {
  from: string;
  to: string;
  total: number;
  count: number;
  byCategory: { name: string; total: number; count: number }[];
  byType: { type: ExpenseType; total: number; count: number }[];
  /** HTML restrito (renderizar com SafeHtml). */
  analysis: string;
}
