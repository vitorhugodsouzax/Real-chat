import { FastifyInstance } from 'fastify';
import { credentialsSchema } from './auth.schema.js';
import { createUser, findUserByUsername, verifyPassword } from './auth.service.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', message: parsed.error.message });
    }

    const existing = await findUserByUsername(parsed.data.username);
    if (existing) {
      return reply.code(409).send({ error: 'username_taken', message: 'Username already exists' });
    }

    const user = await createUser(parsed.data.username, parsed.data.password);
    const token = app.jwt.sign({ id: user.id, username: user.username });
    return reply.code(201).send({ token, user });
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', message: parsed.error.message });
    }

    const user = await findUserByUsername(parsed.data.username);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return reply.code(401).send({ error: 'invalid_credentials', message: 'Wrong username or password' });
    }

    const token = app.jwt.sign({ id: user.id, username: user.username });
    return reply.send({ token, user: { id: user.id, username: user.username } });
  });
}
