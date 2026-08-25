import { FastifyInstance } from 'fastify';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const ALLOWED = new Map<string, 'image' | 'video'>([
  ['image/png', 'image'],
  ['image/jpeg', 'image'],
  ['image/gif', 'image'],
  ['image/webp', 'image'],
  ['video/mp4', 'video'],
  ['video/webm', 'video'],
]);

const EXTENSION_BY_MIME = new Map<string, string>([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
]);

export async function uploadsRoutes(app: FastifyInstance) {
  app.post(
    '/uploads',
    {
      preHandler: [app.authenticate],
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.code(400).send({ error: 'no_file', message: 'No file provided' });
      }

      const kind = ALLOWED.get(file.mimetype);
      if (!kind) {
        return reply.code(415).send({ error: 'unsupported_type', message: `Unsupported file type: ${file.mimetype}` });
      }

      const ext = EXTENSION_BY_MIME.get(file.mimetype)!;
      const filename = `${randomUUID()}${ext}`;
      const destination = path.join(process.cwd(), 'uploads', filename);
      await pipeline(file.file, createWriteStream(destination));

      if (file.file.truncated) {
        await unlink(destination);
        return reply.code(413).send({ error: 'file_too_large', message: 'File exceeds the maximum upload size' });
      }

      return reply.code(201).send({ url: `/uploads/${filename}`, type: kind });
    },
  );
}
