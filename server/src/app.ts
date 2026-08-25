import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { channelsRoutes } from './modules/channels/channels.routes.js';
import { messagesRoutes } from './modules/messages/messages.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(jwtPlugin);
  await app.register(authRoutes);
  await app.register(channelsRoutes);
  await app.register(messagesRoutes);

  return app;
}
