import { Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { messageSendSchema } from '../schema.js';
import { isMember } from '../../modules/channels/channels.service.js';
import { saveChannelMessage, saveDirectMessage } from '../../modules/messages/messages.service.js';

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 20;
const sendCounts = new Map<number, { count: number; windowStart: number }>();

function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const entry = sendCounts.get(userId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    sendCounts.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export function registerMessageHandlers(app: FastifyInstance, socket: Socket) {
  socket.on('message:send', async (payload) => {
    try {
      const userId = socket.data.user.id;

      if (isRateLimited(userId)) {
        return socket.emit('error', { code: 'rate_limited', message: 'Too many messages, slow down' });
      }

      const parsed = messageSendSchema.safeParse(payload);
      if (!parsed.success) {
        return socket.emit('error', { code: 'invalid_payload', message: parsed.error.message });
      }

      const { channelId, recipientId, content, attachment } = parsed.data;

      if (channelId) {
        const member = await isMember(channelId, userId);
        if (!member) return socket.emit('error', { code: 'forbidden', message: 'Not a member of this channel' });

        const saved = await saveChannelMessage(channelId, userId, content, attachment);
        app.io.to(`channel:${channelId}`).emit('message:new', { ...saved, senderUsername: socket.data.user.username });
        return;
      }

      const saved = await saveDirectMessage(userId, recipientId!, content, attachment);
      app.io
        .to(`user:${recipientId}`)
        .to(`user:${userId}`)
        .emit('message:new', { ...saved, senderUsername: socket.data.user.username });
    } catch (err) {
      app.log.error(err);
      socket.emit('error', { code: 'internal_error', message: 'Something went wrong' });
    }
  });
}
