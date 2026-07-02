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
export const WEEKDAYS: { value: number; shortKey: string; longKey: string }[] = [
  { value: 1, shortKey: 'weekday.short.1', longKey: 'weekday.long.1' },
  { value: 2, shortKey: 'weekday.short.2', longKey: 'weekday.long.2' },
  { value: 3, shortKey: 'weekday.short.3', longKey: 'weekday.long.3' },
  { value: 4, shortKey: 'weekday.short.4', longKey: 'weekday.long.4' },
  { value: 5, shortKey: 'weekday.short.5', longKey: 'weekday.long.5' },
  { value: 6, shortKey: 'weekday.short.6', longKey: 'weekday.long.6' },
  { value: 7, shortKey: 'weekday.short.7', longKey: 'weekday.long.7' },
];

/** Rótulo curto dos dias de um todo (ex.: "Seg, Qua, Sex"). */
export function formatDays(
  days: number[],
  translate: (key: string) => string,
): string {
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => {
      const key = WEEKDAYS.find((w) => w.value === d)?.shortKey;
      return key ? translate(key) : d;
    })
    .join(', ');
}
