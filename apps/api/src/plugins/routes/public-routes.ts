import type { FastifyInstance } from 'fastify';
import authModule from '@/modules/auth/infrastructure/auth.module';
import userModule from '@/modules/user/infrastructure/user.module';

async function registerPublicRoutes(fastify: FastifyInstance) {
  // Public access routes (hexagonal modules)
  await fastify.register(userModule);
  await fastify.register(authModule);

  // Health checks
  fastify.get('/', async (_, reply) => {
    reply.status(200).send({ message: 'OK' });
  });
  fastify.get('/health', async (_, reply) => {
    reply.status(200).send({ message: 'OK' });
  });
}

export default async function publicRoutesPlugin(
  fastify: FastifyInstance,
  _opts: unknown
) {
  // Public access routes
  await fastify.register(registerPublicRoutes, { prefix: 'api' });
}
