import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';

export default fp(async function jwtPlugin(app: FastifyInstance) {
  app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' });

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'unauthorized', message: 'Invalid or missing token' });
    }
  });
});
