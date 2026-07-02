import i18n from '@/i18n/config';
import { useLocaleStore } from '@/hooks/useLocaleStore';
import { clearToken, getToken } from './authToken';

// Remove barras finais para evitar URLs com "//" ao concatenar com o path.
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '');

/** Erro de API com as mensagens que o backend devolveu (prontas para exibir). */
export class ApiError extends Error {
  readonly messages: string[];
  readonly status: number;

  constructor(messages: string[], status: number) {
    super(messages.join('\n'));
    this.name = 'ApiError';
    this.messages = messages;
    this.status = status;
  }
}

/** Normaliza o corpo de erro do Nest ({ message: string | string[] }). */
function extractMessages(body: unknown, fallback: string): string[] {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.map(String);
    if (typeof message === 'string') return [message];
  }
  return [fallback];
}

/** Cliente HTTP base: serializa JSON e converte erros em ApiError. */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // Anexa o token JWT (quando houver) preservando headers do chamador.
  const token = getToken();
  // Idioma atual → o back traduz mensagens pelo Accept-Language.
  const locale = useLocaleStore.getState().locale;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': locale === 'en' ? 'en-US' : 'pt-BR',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    // Falha de rede / servidor fora do ar.
    throw new ApiError([i18n.t('common:networkError')], 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // Sessão expirada/ausente: limpa o token e manda para o login.
    if (
      response.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      clearToken();
      window.location.href = '/login';
    }
    throw new ApiError(
      extractMessages(body, i18n.t('common:unexpectedError')),
      response.status,
    );
  }

  return body as T;
}
