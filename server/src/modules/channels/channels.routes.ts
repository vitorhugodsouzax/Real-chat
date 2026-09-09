import { FastifyInstance } from 'fastify';
import { createChannelSchema } from './channels.schema.js';
import { listPublicChannels, createChannel, joinChannel, getChannel, PrivateChannelError } from './channels.service.js';

export async function channelsRoutes(app: FastifyInstance) {
  app.get('/channels', { preHandler: [app.authenticate] }, async () => {
    return listPublicChannels();
  });

  app.post('/channels', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = createChannelSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', message: parsed.error.message });
    }
    const user = request.user as { id: number };
    const channel = await createChannel(parsed.data, user.id);
    return reply.code(201).send(channel);
  });

  app.post<{ Params: { id: string } }>('/channels/:id/join', { preHandler: [app.authenticate] }, async (request, reply) => {
    const channelId = Number(request.params.id);
    const channel = await getChannel(channelId);
    if (!channel) {
      return reply.code(404).send({ error: 'not_found', message: 'Channel does not exist' });
    }
    const user = request.user as { id: number };
    try {
      await joinChannel(channelId, user.id);
    } catch (err) {
      if (err instanceof PrivateChannelError) {
        return reply.code(403).send({ error: 'forbidden', message: 'This channel is private' });
      }
      throw err;
    }
    return reply.send({ joined: true });
  });
}
