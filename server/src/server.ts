import 'dotenv/config';
import { buildApp } from './app.js';
import { registerSockets } from './sockets/index.js';

const start = async () => {
  const app = await buildApp();
  await app.ready();
  registerSockets(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: '0.0.0.0' });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
