import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { AddressInfo } from 'node:net';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { buildApp } from '../../src/app.js';
import { registerSockets } from '../../src/sockets/index.js';
import { db, pool } from '../../src/db/client.js';
import { users } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('socket auth', () => {
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
    await db.delete(users).where(eq(users.username, 'socket_auth_test_user'));
    await pool.end();
  });

  function connect(token?: string): Promise<ClientSocket> {
    return new Promise((resolve, reject) => {
      const socket = ioClient(baseUrl, { auth: { token }, transports: ['websocket'] });
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', (err) => reject(err));
    });
  }

  it('rejects a connection with no token', async () => {
    await expect(connect(undefined)).rejects.toThrow();
  });

  it('accepts a connection with a valid token', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: 'socket_auth_test_user', password: 'correct-horse' },
    });
    const token = register.json().token;

    const socket = await connect(token);
    expect(socket.connected).toBe(true);
    socket.disconnect();
  });
});
