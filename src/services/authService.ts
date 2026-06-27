import { clearToken, setToken } from './authToken';
import { apiRequest } from './http';

export { ApiError } from './http';

export const authService = {
  /** Faz login e guarda o token JWT. Lança ApiError em credenciais inválidas. */
  async login(username: string, password: string): Promise<void> {
    const { accessToken } = await apiRequest<{ accessToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
    );
    setToken(accessToken);
  },

  logout(): void {
    clearToken();
  },
};
