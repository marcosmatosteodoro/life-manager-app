export interface DebtPayment {
  id: number;
  debtId: number;
  value: number;
  date: string;
  description: string | null;
  expenseId: number | null;
  createdAt: string;
}

export interface Debt {
  id: number;
  name: string;
  totalAmount: number;
  description: string | null;
  payments?: DebtPayment[];
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
  /** Soma das quitações. */
  paidAmount?: number;
  /** Saldo em aberto. */
  remaining?: number;
  /** Se já foi quitada. */
  isSettled?: boolean;
}

export interface DebtInput {
  name: string;
  totalAmount: number;
  description?: string | null;
}

export interface DebtPaymentInput {
  value?: number;
  date: string;
  description?: string | null;
  /** Quita o saldo restante inteiro (ignora value). */
  settleAll?: boolean;
}

export interface DebtListResponse {
  count: number;
  rows: Debt[];
  /** Soma dos valores totais. */
  totalOwed: number;
  /** Soma dos saldos em aberto. */
  totalRemaining: number;
}
