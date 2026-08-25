import { z } from 'zod';

export const createChannelSchema = z.object({
  name: z.string().min(2).max(50),
  topic: z.string().max(200).optional(),
  isPrivate: z.boolean().optional().default(false),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
