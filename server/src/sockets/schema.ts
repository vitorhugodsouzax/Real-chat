import { z } from 'zod';

export const channelJoinSchema = z.object({ channelId: z.number().int().positive() });

export const messageSendSchema = z
  .object({
    channelId: z.number().int().positive().optional(),
    recipientId: z.number().int().positive().optional(),
    content: z.string().min(1).max(4000),
    attachment: z.object({ url: z.string(), type: z.enum(['image', 'video']) }).optional(),
  })
  .refine((v) => Boolean(v.channelId) !== Boolean(v.recipientId), {
    message: 'Exactly one of channelId or recipientId must be set',
  });

export type MessageSendInput = z.infer<typeof messageSendSchema>;
