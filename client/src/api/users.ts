import { apiFetch } from './client.js';

export type ChatUser = { id: number; username: string };

export function listUsers() {
  return apiFetch<ChatUser[]>('/users');
}
