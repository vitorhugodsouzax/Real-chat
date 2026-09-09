import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { db, pool } from '../src/db/client.js';
import { users } from '../src/db/schema.js';
import { inArray } from 'drizzle-orm';

describe('GET /users', () => {
  const usernames = ['users_test_a', 'users_test_b'];

  afterAll(async () => {
    await db.delete(users).where(inArray(users.username, usernames));
    await pool.end();
  });

  it('lists other users but not the caller', async () => {
    const app = await buildApp();
    const a = await app.inject({ method: 'POST', url: '/auth/register', payload: { username: usernames[0], password: 'correct-horse' } });
    const b = await app.inject({ method: 'POST', url: '/auth/register', payload: { username: usernames[1], password: 'correct-horse' } });

    const res = await app.inject({
      method: 'GET',
      url: '/users',
      headers: { authorization: `Bearer ${a.json().token}` },
    });

    const usernamesInResponse = res.json().map((u: any) => u.username);
    expect(usernamesInResponse).toContain(usernames[1]);
    expect(usernamesInResponse).not.toContain(usernames[0]);
    void b;
  });
});
