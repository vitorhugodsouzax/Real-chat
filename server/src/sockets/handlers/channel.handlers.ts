import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { channelJoinSchema } from '../schema.js';
import { isMember, joinChannel, PrivateChannelError } from '../../modules/channels/channels.service.js';

export function registerChannelHandlers(app: FastifyInstance, socket: Socket) {
  socket.on('channel:join', async (payload) => {
    try {
      const parsed = channelJoinSchema.safeParse(payload);
      if (!parsed.success) return socket.emit('error', { code: 'invalid_payload', message: parsed.error.message });

      const userId = socket.data.user.id;
      try {
        await joinChannel(parsed.data.channelId, userId);
      } catch (err) {
        if (err instanceof PrivateChannelError) {
          return socket.emit('error', { code: 'forbidden', message: 'This channel is private' });
        }
        throw err;
      }
      socket.join(`channel:${parsed.data.channelId}`);

      socket.to(`channel:${parsed.data.channelId}`).emit('user:joined', {
        channelId: parsed.data.channelId,
        username: socket.data.user.username,
      });
    } catch (err) {
      app.log.error(err);
      socket.emit('error', { code: 'internal_error', message: 'Something went wrong' });
    }
  });

  socket.on('channel:leave', async (payload) => {
    try {
      const parsed = channelJoinSchema.safeParse(payload);
      if (!parsed.success) return socket.emit('error', { code: 'invalid_payload', message: parsed.error.message });
      socket.leave(`channel:${parsed.data.channelId}`);
    } catch (err) {
      app.log.error(err);
      socket.emit('error', { code: 'internal_error', message: 'Something went wrong' });
    }
  });
}

export async function ensureChannelMembership(channelId: number, userId: number) {
  return isMember(channelId, userId);
}
