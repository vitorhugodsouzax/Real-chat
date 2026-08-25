import { FastifyInstance } from 'fastify';
import { isMember } from '../channels/channels.service.js';
import { getChannelMessages, getDirectMessages } from './messages.service.js';

function paginate(rows: { id: number }[]) {
  const nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null;
  return { messages: rows, nextCursor };
}

export async function messagesRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string }; Querystring: { cursor?: string; limit?: string } }>(
    '/channels/:id/messages',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const channelId = Number(request.params.id);
      const user = request.user as { id: number };

      const member = await isMember(channelId, user.id);
      if (!member) {
        return reply.code(403).send({ error: 'forbidden', message: 'Not a member of this channel' });
      }

      const cursor = request.query.cursor ? Number(request.query.cursor) : undefined;
      const limit = request.query.limit ? Number(request.query.limit) : undefined;
      const rows = await getChannelMessages(channelId, cursor, limit);
      return reply.send(paginate(rows));
    },
  );

  app.get<{ Params: { userId: string }; Querystring: { cursor?: string; limit?: string } }>(
    '/dm/:userId/messages',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const otherUserId = Number(request.params.userId);
      const user = request.user as { id: number };
      const cursor = request.query.cursor ? Number(request.query.cursor) : undefined;
      const limit = request.query.limit ? Number(request.query.limit) : undefined;
      const rows = await getDirectMessages(user.id, otherUserId, cursor, limit);
      return reply.send(paginate(rows));
    },
  );
}
