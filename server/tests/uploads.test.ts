import { describe, it, expect, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { db, pool } from '../src/db/client.js';
import { users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';

describe('uploads', () => {
  afterAll(async () => {
    await db.delete(users).where(eq(users.username, 'uploads_test_user'));
    await pool.end();
  });

  it('accepts a png upload and serves it back', async () => {
    const app = await buildApp();
    const register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: 'uploads_test_user', password: 'correct-horse' },
    });
    const token = register.json().token;

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const boundary = '----vitestBoundary';
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="test.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      pngHeader.toString('binary') +
      `\r\n--${boundary}--\r\n`;

    const res = await app.inject({
      method: 'POST',
      url: '/uploads',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload: Buffer.from(body, 'binary'),
    });

    expect(res.statusCode).toBe(201);
    const body2 = res.json();
    expect(body2.type).toBe('image');

    const savedPath = path.join(process.cwd(), body2.url.replace('/uploads/', 'uploads/'));
    expect(existsSync(savedPath)).toBe(true);
    unlinkSync(savedPath);
  });
});
