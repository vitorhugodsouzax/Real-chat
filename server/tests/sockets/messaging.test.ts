import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { AddressInfo } from 'node:net';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { buildApp } from '../../src/app.js';
import { registerSockets } from '../../src/sockets/index.js';
import { db, pool } from '../../src/db/client.js';
import { users, channels, channelMembers, messages } from '../../src/db/schema.js';
import { eq, inArray } from 'drizzle-orm';

describe('real-time channel messaging', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let baseUrl: string;
  const usernames = ['msg_socket_user_a', 'msg_socket_user_b'];

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    registerSockets(app);
    await app.listen({ port: 0 });
    const address = app.server.address() as AddressInfo;
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
    const rows = await db.select({ id: users.id }).from(users).where(inArray(users.username, usernames));
    const ids = rows.map((r) => r.id);
    if (ids.length) await db.delete(messages).where(inArray(messages.senderId, ids));
    const channelRows = await db.select({ id: channels.id }).from(channels).where(eq(channels.name, 'socket-messaging-test'));
    const channelIds = channelRows.map((r) => r.id);
    if (channelIds.length) await db.delete(channelMembers).where(inArray(channelMembers.channelId, channelIds));
    await db.delete(channels).where(eq(channels.name, 'socket-messaging-test'));
    await db.delete(users).where(inArray(users.username, usernames));
    await pool.end();
  });

  function connect(token: string): Promise<ClientSocket> {
    return new Promise((resolve, reject) => {
      const socket = ioClient(baseUrl, { auth: { token }, transports: ['websocket'] });
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', reject);
    });
  }

  it('delivers a channel message to another member in real time', async () => {
    const registerA = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: usernames[0], password: 'correct-horse' },
    });
    const tokenA = registerA.json().token;

    const createChannel = await app.inject({
      method: 'POST',
      url: '/channels',
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: 'socket-messaging-test' },
    });
    const channelId = createChannel.json().id;

    const registerB = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: usernames[1], password: 'correct-horse' },
    });
    const tokenB = registerB.json().token;
    await app.inject({
      method: 'POST',
      url: `/channels/${channelId}/join`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    const socketA = await connect(tokenA);
    const socketB = await connect(tokenB);
    socketA.emit('channel:join', { channelId });
    socketB.emit('channel:join', { channelId });

    const received = new Promise<any>((resolve) => {
      socketB.on('message:new', resolve);
    });

    await new Promise((r) => setTimeout(r, 100));
    socketA.emit('message:send', { channelId, content: 'hello from A' });

    const message = await received;
    expect(message.content).toBe('hello from A');
    expect(message.channelId).toBe(channelId);

    socketA.disconnect();
    socketB.disconnect();
  });
});
