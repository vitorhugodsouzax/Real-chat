import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/app.js';

describe('error handling', () => {
  it('returns a standard JSON shape for 404s', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/does-not-exist' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'not_found', message: 'Route not found' });
  });

  it('returns a standard JSON shape for validation errors', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: 'a' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('invalid_body');
  });
});
