import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import path from 'node:path';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import jwtPlugin from './plugins/jwt.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { channelsRoutes } from './modules/channels/channels.routes.js';
import { messagesRoutes } from './modules/messages/messages.routes.js';
import { uploadsRoutes } from './modules/uploads/uploads.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(errorHandlerPlugin);
  await app.register(rateLimit, { global: false });

  await app.register(cors, {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  });

  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(jwtPlugin);
  await app.register(authRoutes);
  await app.register(channelsRoutes);
  await app.register(messagesRoutes);
  await app.register(uploadsRoutes);

  return app;
}
