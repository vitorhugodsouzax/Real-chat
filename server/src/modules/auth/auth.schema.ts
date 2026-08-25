import { z } from 'zod';

export const credentialsSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(72),
});

export type Credentials = z.infer<typeof credentialsSchema>;
