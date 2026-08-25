import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { db, pool } from '../src/db/client.js';
import { users, channels, channelMembers } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

async function registerUser(app: Awaited<ReturnType<typeof buildApp>>, username: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { username, password: 'correct-horse' },
  });
  return res.json().token as string;
}

describe('channels', () => {
  afterAll(async () => {
    const [testChannel] = await db.select().from(channels).where(eq(channels.name, 'general-test'));
    if (testChannel) {
      await db.delete(channelMembers).where(eq(channelMembers.channelId, testChannel.id));
    }
    await db.delete(channels).where(eq(channels.name, 'general-test'));
    await db.delete(users).where(eq(users.username, 'channels_test_user'));
    await db.delete(users).where(eq(users.username, 'channels_test_user_2'));
    await pool.end();
  });

  it('creates a channel, lists it, and lets another user join', async () => {
    const app = await buildApp();
    const token = await registerUser(app, 'channels_test_user');

    const create = await app.inject({
      method: 'POST',
      url: '/channels',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'general-test', topic: 'testing' },
    });
    expect(create.statusCode).toBe(201);
    const channelId = create.json().id;

    const list = await app.inject({
      method: 'GET',
      url: '/channels',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(list.json().some((c: any) => c.id === channelId)).toBe(true);

    const token2 = await registerUser(app, 'channels_test_user_2');
    const join = await app.inject({
      method: 'POST',
      url: `/channels/${channelId}/join`,
      headers: { authorization: `Bearer ${token2}` },
    });
    expect(join.statusCode).toBe(200);
    expect(join.json()).toEqual({ joined: true });
  });

  it('rejects unauthenticated access', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/channels' });
    expect(res.statusCode).toBe(401);
  });
});
