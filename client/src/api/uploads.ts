import { apiFetch } from './client.js';

export function uploadFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<{ url: string; type: 'image' | 'video' }>('/uploads', {
    method: 'POST',
    body: form,
  });
}
