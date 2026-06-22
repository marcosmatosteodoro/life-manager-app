const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

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
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // Falha de rede / servidor fora do ar.
    throw new ApiError(
      ['Não foi possível conectar à API. Verifique se o servidor está no ar.'],
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      extractMessages(body, 'Ocorreu um erro inesperado.'),
      response.status,
    );
  }

  return body as T;
}
