/** Gasto fixo: despesa recorrente (todo mês). Pode ter valor variável. */
export interface FixedExpense {
  id: number;
  name: string;
  value: number;
  /** Dia do mês do pagamento (1-31). */
  paymentDay: number;
  /** Valor muda um pouco a cada mês (ex.: conta de luz). */
  isVariable: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface FixedExpenseInput {
  name: string;
  value: number;
  paymentDay: number;
  isVariable?: boolean;
  description?: string | null;
}

export interface FixedExpenseListResponse {
  count: number;
  rows: FixedExpense[];
  /** Total mensal (soma dos valores). */
  monthTotal: number;
}
