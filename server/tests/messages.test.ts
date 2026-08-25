import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { db, pool } from '../src/db/client.js';
import { users, channels, channelMembers, messages } from '../src/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { saveChannelMessage } from '../src/modules/messages/messages.service.js';

async function registerUser(app: Awaited<ReturnType<typeof buildApp>>, username: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { username, password: 'correct-horse' },
  });
  return res.json() as { token: string; user: { id: number } };
}

describe('messages', () => {
  afterAll(async () => {
    const testUsers = await db.select({ id: users.id }).from(users).where(eq(users.username, 'messages_test_user'));
    const userIds = testUsers.map((u) => u.id);

    const testChannels = await db.select({ id: channels.id }).from(channels).where(eq(channels.name, 'messages-test-channel'));
    const channelIds = testChannels.map((c) => c.id);

    if (userIds.length > 0) {
      await db.delete(messages).where(inArray(messages.senderId, userIds));
    }
    if (channelIds.length > 0) {
      await db.delete(channelMembers).where(inArray(channelMembers.channelId, channelIds));
    }
    await db.delete(channels).where(eq(channels.name, 'messages-test-channel'));
    await db.delete(users).where(eq(users.username, 'messages_test_user'));
    await pool.end();
  });

  it('returns paginated channel history newest-first', async () => {
    const app = await buildApp();
    const { token, user } = await registerUser(app, 'messages_test_user');

    const create = await app.inject({
      method: 'POST',
      url: '/channels',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'messages-test-channel' },
    });
    const channelId = create.json().id;

    await saveChannelMessage(channelId, user.id, 'first');
    await saveChannelMessage(channelId, user.id, 'second');

    const res = await app.inject({
      method: 'GET',
      url: `/channels/${channelId}/messages`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.messages[0].content).toBe('second');
    expect(body.messages[1].content).toBe('first');
  });

  it('forbids non-members from reading channel history', async () => {
    const app = await buildApp();
    const outsider = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: 'messages_outsider', password: 'correct-horse' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/channels/999999/messages',
      headers: { authorization: `Bearer ${outsider.json().token}` },
    });
    expect(res.statusCode).toBe(403);

    await db.delete(users).where(eq(users.username, 'messages_outsider'));
  });
});
