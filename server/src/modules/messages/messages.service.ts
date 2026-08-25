import { and, eq, lt, or, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { messages } from '../../db/schema.js';

const DEFAULT_LIMIT = 30;

export type Attachment = { url: string; type: 'image' | 'video' } | undefined;

export async function saveChannelMessage(channelId: number, senderId: number, content: string, attachment?: Attachment) {
  const [row] = await db
    .insert(messages)
    .values({
      channelId,
      senderId,
      content,
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type,
    })
    .returning();
  return row;
}

export async function saveDirectMessage(senderId: number, recipientId: number, content: string, attachment?: Attachment) {
  const [row] = await db
    .insert(messages)
    .values({
      recipientId,
      senderId,
      content,
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type,
    })
    .returning();
  return row;
}

export async function getChannelMessages(channelId: number, cursor?: number, limit = DEFAULT_LIMIT) {
  const conditions = cursor
    ? and(eq(messages.channelId, channelId), lt(messages.id, cursor))
    : eq(messages.channelId, channelId);

  const rows = await db
    .select()
    .from(messages)
    .where(conditions)
    .orderBy(desc(messages.id))
    .limit(limit);

  return rows;
}

export async function getDirectMessages(userA: number, userB: number, cursor?: number, limit = DEFAULT_LIMIT) {
  const pairCondition = or(
    and(eq(messages.senderId, userA), eq(messages.recipientId, userB)),
    and(eq(messages.senderId, userB), eq(messages.recipientId, userA)),
  );
  const conditions = cursor ? and(pairCondition, lt(messages.id, cursor)) : pairCondition;

  const rows = await db
    .select()
    .from(messages)
    .where(conditions)
    .orderBy(desc(messages.id))
    .limit(limit);

  return rows;
}
