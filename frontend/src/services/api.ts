const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      ? String((payload as { error: { message?: string } }).error.message ?? 'Request failed')
      : 'Request failed';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
