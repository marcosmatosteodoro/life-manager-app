import { apiRequest } from './http';
import type { AppUser, CreateUserInput, UpdateUserInput } from './user.types';

export { ApiError } from './http';

/** Gestão de usuários — endpoints `/users` (somente admin no back). */
export const userAdminService = {
  list(): Promise<AppUser[]> {
    return apiRequest<AppUser[]>('/users');
  },
  create(input: CreateUserInput): Promise<AppUser> {
    return apiRequest<AppUser>('/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: UpdateUserInput): Promise<AppUser> {
    return apiRequest<AppUser>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/users/${id}`, { method: 'DELETE' });
  },
};
