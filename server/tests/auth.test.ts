import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { db, pool } from '../src/db/client.js';
import { users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('auth', () => {
  afterAll(async () => {
    await db.delete(users).where(eq(users.username, 'auth_test_user'));
    await pool.end();
  });

  it('registers, then logs in with the same credentials', async () => {
    const app = await buildApp();

    const register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: 'auth_test_user', password: 'correct-horse' },
    });
    expect(register.statusCode).toBe(201);
    expect(register.json().token).toBeTypeOf('string');

    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { username: 'auth_test_user', password: 'correct-horse' },
    });
    expect(login.statusCode).toBe(200);
    expect(login.json().user.username).toBe('auth_test_user');
  });

  it('rejects login with a wrong password', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { username: 'auth_test_user', password: 'wrong-password' },
    });
    expect(res.statusCode).toBe(401);
  });
});
