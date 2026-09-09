import { apiFetch } from './client.js';

export type Message = {
  id: number;
  channelId: number | null;
  recipientId: number | null;
  senderId: number;
  content: string | null;
  attachmentUrl: string | null;
  attachmentType: 'image' | 'video' | null;
  createdAt: string;
};

type HistoryResponse = { messages: Message[]; nextCursor: number | null };

export function getChannelMessages(channelId: number, cursor?: number) {
  const qs = cursor ? `?cursor=${cursor}` : '';
  return apiFetch<HistoryResponse>(`/channels/${channelId}/messages${qs}`);
}

export function getDirectMessages(userId: number, cursor?: number) {
  const qs = cursor ? `?cursor=${cursor}` : '';
  return apiFetch<HistoryResponse>(`/dm/${userId}/messages${qs}`);
}
