import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { channels, channelMembers } from '../../db/schema.js';

export async function listPublicChannels() {
  return db
    .select({ id: channels.id, name: channels.name, topic: channels.topic, isPrivate: channels.isPrivate })
    .from(channels)
    .where(eq(channels.isPrivate, false));
}

export async function createChannel(input: { name: string; topic?: string; isPrivate: boolean }, createdBy: number) {
  const [channel] = await db.insert(channels).values({ ...input, createdBy }).returning();
  await db.insert(channelMembers).values({ channelId: channel.id, userId: createdBy });
  return channel;
}

export async function joinChannel(channelId: number, userId: number) {
  const already = await isMember(channelId, userId);
  if (already) return;
  await db.insert(channelMembers).values({ channelId, userId });
}

export async function isMember(channelId: number, userId: number) {
  const [row] = await db
    .select()
    .from(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));
  return Boolean(row);
}

export async function getChannel(channelId: number) {
  const [channel] = await db.select().from(channels).where(eq(channels.id, channelId));
  return channel ?? null;
}
