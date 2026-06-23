import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    token: string | null;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      request.token = token;
    }
  });
});
