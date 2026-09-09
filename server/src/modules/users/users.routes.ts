import { FastifyInstance } from 'fastify';
import { ne } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';

export async function usersRoutes(app: FastifyInstance) {
  app.get('/users', { preHandler: [app.authenticate] }, async (request) => {
    const currentUser = request.user as { id: number };
    return db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(ne(users.id, currentUser.id));
  });
}
