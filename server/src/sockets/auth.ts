import { FastifyInstance } from 'fastify';
import { Socket } from 'socket.io';

export function socketAuthMiddleware(app: FastifyInstance) {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('missing token');
      const payload = app.jwt.verify<{ id: number; username: string }>(token);
      socket.data.user = { id: payload.id, username: payload.username };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  };
}
