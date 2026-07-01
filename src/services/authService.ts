import { clearToken, setToken } from './authToken';
import { apiRequest } from './http';

export { ApiError } from './http';

export const authService = {
  /**
   * Faz login e guarda o token JWT. Lança ApiError em credenciais inválidas.
   * Retorna `mustChangePassword` para o front forçar a troca no 1º acesso.
   */
  async login(
    username: string,
    password: string,
  ): Promise<{ mustChangePassword: boolean }> {
    const { accessToken, mustChangePassword } = await apiRequest<{
      accessToken: string;
      mustChangePassword: boolean;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(accessToken);
    return { mustChangePassword };
  },

  logout(): void {
    clearToken();
  },
};
