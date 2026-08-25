import { apiFetch } from './client.js';

export type Channel = { id: number; name: string; topic: string | null; isPrivate: boolean };

export function listChannels() {
  return apiFetch<Channel[]>('/channels');
}

export function createChannel(input: { name: string; topic?: string; isPrivate?: boolean }) {
  return apiFetch<Channel>('/channels', { method: 'POST', body: JSON.stringify(input) });
}

export function joinChannel(channelId: number) {
  return apiFetch<{ joined: boolean }>(`/channels/${channelId}/join`, { method: 'POST' });
}
