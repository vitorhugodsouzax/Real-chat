import { useAuthStore } from '../store/authStore.js';

export const API_URL = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error {
  constructor(public status: number, public error: string, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'unknown', message: res.statusText }));
    throw new ApiError(res.status, body.error, body.message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function registerRequest(username: string, password: string) {
  return apiFetch<{ token: string; user: { id: number; username: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function loginRequest(username: string, password: string) {
  return apiFetch<{ token: string; user: { id: number; username: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
