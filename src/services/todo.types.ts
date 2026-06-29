/** Afazer (todo) retornado pela API. */
export interface Todo {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  /** Dias ISO em que se repete (1=seg … 7=dom). */
  days: number[];
  tag: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface TodoInput {
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  days: number[];
  tag?: string | null;
}

/** Check (marcação) de um afazer num dia. */
export interface TodoCheck {
  id: number;
  todoId: number;
  date: string;
  checked: boolean;
  todo?: Todo;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface TodoCheckInput {
  todoId: number;
  date: string;
  checked?: boolean;
}

export interface TodoListResponse {
  count: number;
  rows: Todo[];
}

export interface TodoCheckListResponse {
  count: number;
  rows: TodoCheck[];
}

/** Dias da semana (ISO 1=seg … 7=dom) para seletores e exibição. */
export const WEEKDAYS: { value: number; short: string; long: string }[] = [
  { value: 1, short: 'Seg', long: 'Segunda' },
  { value: 2, short: 'Ter', long: 'Terça' },
  { value: 3, short: 'Qua', long: 'Quarta' },
  { value: 4, short: 'Qui', long: 'Quinta' },
  { value: 5, short: 'Sex', long: 'Sexta' },
  { value: 6, short: 'Sáb', long: 'Sábado' },
  { value: 7, short: 'Dom', long: 'Domingo' },
];

/** Rótulo curto dos dias de um todo (ex.: "Seg, Qua, Sex"). */
export function formatDays(days: number[]): string {
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAYS.find((w) => w.value === d)?.short ?? d)
    .join(', ');
}
