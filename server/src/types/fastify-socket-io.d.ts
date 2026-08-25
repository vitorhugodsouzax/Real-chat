import { Server } from 'socket.io';

// fastify-socket.io intentionally ships its `io` decorator untyped so
// consumers can supply their own Socket.IO server typings (see its README).
// This augments FastifyInstance so `app.io` is recognized as a Socket.IO Server.
declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}
