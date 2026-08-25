import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarColor: text('avatar_color'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  topic: text('topic'),
  isPrivate: boolean('is_private').notNull().default(false),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const channelMembers = pgTable(
  'channel_members',
  {
    channelId: integer('channel_id').notNull().references(() => channels.id),
    userId: integer('user_id').notNull().references(() => users.id),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.channelId, table.userId] }),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    channelId: integer('channel_id').references(() => channels.id),
    senderId: integer('sender_id').notNull().references(() => users.id),
    recipientId: integer('recipient_id').references(() => users.id),
    content: text('content'),
    attachmentUrl: text('attachment_url'),
    attachmentType: text('attachment_type'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    channelOrRecipient: check(
      'channel_or_recipient',
      sql`(${table.channelId} is not null and ${table.recipientId} is null) or (${table.channelId} is null and ${table.recipientId} is not null)`,
    ),
  }),
);
