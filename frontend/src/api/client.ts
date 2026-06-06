/**
 * Cliente HTTP central — auto-deteccao de ambiente, header de Authorization,
 * tratamento padronizado de 401 e parsing de erros do backend Spring.
 */

const HOST = window.location.hostname;
const IS_LOCAL = HOST === 'localhost' || HOST === '127.0.0.1';

export const API_BASE_URL = IS_LOCAL
  ? 'http://localhost:8080'
  : 'https://bloodcrown-api.onrender.com';

const TOKEN_KEY = 'authToken';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  /**
   * Le o `sub` do payload JWT (sem verificar assinatura — apenas leitura).
   * Backend TokenService usa withSubject(user.getUsername()).
   */
  getUsername: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  },
  /**
   * Le o claim `id` (userId) do payload JWT. Usado p.ex. pra ignorar o eco do
   * proprio evento realtime (porUserId). Backend usa withClaim("id", userId).
   */
  getUserId: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.id === 'string' ? payload.id : null;
    } catch {
      return null;
    }
  },
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: string | null;

  constructor(message: string, status: number, body: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

/**
 * Listener de sessao expirada (401). UI registra um handler para redirecionar
 * pro login sem que o api/ precise conhecer router/window. Multiplas chamadas
 * em paralelo nao geram redirects duplicados — o handler decide.
 */
let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = tokenStorage.get();
    if (!token) {
      unauthorizedHandler?.();
      throw new ApiError('Sessao expirada', 401);
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    tokenStorage.clear();
    unauthorizedHandler?.();
    throw new ApiError('Sessao expirada', 401);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => null);
    throw new ApiError(
      text || `Erro ${response.status} na requisicao ${method} ${path}`,
      response.status,
      text,
    );
  }

  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined as T;
  return (await response.json()) as T;
}
