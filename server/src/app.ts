import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
