import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { channelJoinSchema } from '../schema.js';
import { isMember, joinChannel } from '../../modules/channels/channels.service.js';

export function registerChannelHandlers(app: FastifyInstance, socket: Socket) {
  socket.on('channel:join', async (payload) => {
    const parsed = channelJoinSchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error', { code: 'invalid_payload', message: parsed.error.message });

    const userId = socket.data.user.id;
    await joinChannel(parsed.data.channelId, userId);
    socket.join(`channel:${parsed.data.channelId}`);

    socket.to(`channel:${parsed.data.channelId}`).emit('user:joined', {
      channelId: parsed.data.channelId,
      username: socket.data.user.username,
    });
  });

  socket.on('channel:leave', async (payload) => {
    const parsed = channelJoinSchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error', { code: 'invalid_payload', message: parsed.error.message });
    socket.leave(`channel:${parsed.data.channelId}`);
  });
}

export async function ensureChannelMembership(channelId: number, userId: number) {
  return isMember(channelId, userId);
}
