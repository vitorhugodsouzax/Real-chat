import { FastifyInstance } from 'fastify';
import { socketAuthMiddleware } from './auth.js';
import { registerChannelHandlers } from './handlers/channel.handlers.js';
import { registerMessageHandlers } from './handlers/message.handlers.js';
import { registerPresenceHandlers } from './handlers/presence.handlers.js';

export function registerSockets(app: FastifyInstance) {
  app.io.use(socketAuthMiddleware(app));

  app.io.on('connection', (socket) => {
    socket.join(`user:${socket.data.user.id}`);
    app.log.info(`socket connected: user ${socket.data.user.id}`);

    registerChannelHandlers(app, socket);
    registerMessageHandlers(app, socket);
    registerPresenceHandlers(app, socket);

    socket.on('disconnect', () => {
      app.log.info(`socket disconnected: user ${socket.data.user.id}`);
    });
  });
}
