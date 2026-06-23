import type { FastifyInstance } from 'fastify';
import habitModule from '@/modules/habit/infrastructure/habit.module';
import habitLogModule from '@/modules/habitLog/infrastructure/habitLog.module';
import { validateUser } from './middlewares/auth.middleware';

async function registerProtectedRoutes(fastify: FastifyInstance) {
  // habit endpoints
  await fastify.register(habitModule);
  // habit log endpoints
  await fastify.register(habitLogModule);
}

export default async function protectedRoutesPlugin(
  fastify: FastifyInstance,
  _opts: unknown
) {
  fastify.addHook('onRequest', validateUser(fastify));

  // Admin Routes
  await fastify.register(registerProtectedRoutes, { prefix: 'api' });
}
