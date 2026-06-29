import { apiRequest } from './http';
import type { Todo, TodoInput, TodoListResponse } from './todo.types';

export { ApiError } from './http';

export const todoService = {
  list(): Promise<TodoListResponse> {
    return apiRequest<TodoListResponse>('/todo');
  },

  get(id: number): Promise<Todo> {
    return apiRequest<Todo>(`/todo/${id}`);
  },

  create(input: TodoInput): Promise<Todo> {
    return apiRequest<Todo>('/todo', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: Partial<TodoInput>): Promise<Todo> {
    return apiRequest<Todo>(`/todo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/todo/${id}`, { method: 'DELETE' });
  },
};
