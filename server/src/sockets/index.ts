import { FastifyInstance } from 'fastify';
import { socketAuthMiddleware } from './auth.js';

export function registerSockets(app: FastifyInstance) {
  app.io.use(socketAuthMiddleware(app));

  app.io.on('connection', (socket) => {
    app.log.info(`socket connected: user ${socket.data.user.id}`);

    socket.on('disconnect', () => {
      app.log.info(`socket disconnected: user ${socket.data.user.id}`);
    });
  });
}
