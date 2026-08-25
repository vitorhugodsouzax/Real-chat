import { describe, it, expect, afterAll } from 'vitest';
import { db, pool } from '../../src/db/client.js';
import { users } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('users table', () => {
  afterAll(async () => {
    await db.delete(users).where(eq(users.username, 'schema_test_user'));
    await pool.end();
  });

  it('inserts and reads back a user', async () => {
    const [inserted] = await db
      .insert(users)
      .values({ username: 'schema_test_user', passwordHash: 'x' })
      .returning();

    expect(inserted.id).toBeTypeOf('number');
    expect(inserted.username).toBe('schema_test_user');
  });
});
