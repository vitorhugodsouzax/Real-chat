import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    app.log.error(error);
    reply.code(statusCode).send({
      error: statusCode === 500 ? 'internal_error' : 'bad_request',
      message: statusCode === 500 ? 'Something went wrong' : error.message,
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: 'not_found', message: 'Route not found' });
  });
});
