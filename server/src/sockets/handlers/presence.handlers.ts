import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const typingSchema = z.object({ channelId: z.number().int().positive() });

const onlineUsers = new Map<number, number>(); // userId -> connection count

function broadcastPresence(app: FastifyInstance) {
  app.io.emit('presence:update', { onlineUserIds: Array.from(onlineUsers.keys()) });
}

export function registerPresenceHandlers(app: FastifyInstance, socket: Socket) {
  const userId = socket.data.user.id as number;
  onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1);
  broadcastPresence(app);

  socket.on('user:typing', (payload) => {
    const parsed = typingSchema.safeParse(payload);
    if (!parsed.success) return;
    socket.to(`channel:${parsed.data.channelId}`).emit('user:typing', {
      channelId: parsed.data.channelId,
      username: socket.data.user.username,
    });
  });

  socket.on('disconnect', () => {
    const remaining = (onlineUsers.get(userId) ?? 1) - 1;
    if (remaining <= 0) onlineUsers.delete(userId);
    else onlineUsers.set(userId, remaining);
    broadcastPresence(app);
  });
}
