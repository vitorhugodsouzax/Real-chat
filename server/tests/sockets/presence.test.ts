import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { AddressInfo } from 'node:net';
import { io as ioClient } from 'socket.io-client';
import { buildApp } from '../../src/app.js';
import { registerSockets } from '../../src/sockets/index.js';
import { db, pool } from '../../src/db/client.js';
import { users } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('presence', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let baseUrl: string;

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
    await db.delete(users).where(eq(users.username, 'presence_test_user'));
    await pool.end();
  });

  it('broadcasts the connecting user as online', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: 'presence_test_user', password: 'correct-horse' },
    });
    const { token, user } = register.json();

    const socket = ioClient(baseUrl, { auth: { token }, transports: ['websocket'] });
    const updatePromise = new Promise<any>((resolve) => socket.on('presence:update', resolve));
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', reject);
    });
    const update = await updatePromise;

    expect(update.onlineUserIds).toContain(user.id);
    socket.disconnect();
  });
});
