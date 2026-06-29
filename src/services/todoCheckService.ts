import { apiRequest } from './http';
import type {
  TodoCheck,
  TodoCheckInput,
  TodoCheckListResponse,
} from './todo.types';

export { ApiError } from './http';

export const todoCheckService = {
  /** Checks de hoje (o backend cria os que faltam para os afazeres do dia). */
  today(): Promise<TodoCheck[]> {
    return apiRequest<TodoCheck[]>('/todo-check/today');
  },

  /** Histórico de checks, com filtro opcional de período e/ou afazer. */
  list(filter?: {
    from?: string;
    to?: string;
    todoId?: number;
  }): Promise<TodoCheckListResponse> {
    const params = new URLSearchParams();
    if (filter?.from) params.set('from', filter.from);
    if (filter?.to) params.set('to', filter.to);
    if (filter?.todoId != null) params.set('todoId', String(filter.todoId));
    const qs = params.toString();
    return apiRequest<TodoCheckListResponse>(
      `/todo-check${qs ? `?${qs}` : ''}`,
    );
  },

  create(input: TodoCheckInput): Promise<TodoCheck> {
    return apiRequest<TodoCheck>('/todo-check', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(
    id: number,
    input: Partial<TodoCheckInput>,
  ): Promise<TodoCheck> {
    return apiRequest<TodoCheck>(`/todo-check/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/todo-check/${id}`, { method: 'DELETE' });
  },
};
