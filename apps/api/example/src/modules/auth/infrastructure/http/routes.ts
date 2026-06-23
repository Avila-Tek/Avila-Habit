import { FastifyInstance } from 'fastify';
import { AuthController } from './AuthController';

export function registerAuthRoutes(controller: AuthController) {
  return async function (fastify: FastifyInstance) {
    fastify.post('/auth/sign-in', controller.signIn.bind(controller));
    fastify.post('/auth/sign-up', controller.signUp.bind(controller));
    fastify.get('/auth/current-user', controller.currentUser.bind(controller));
  };
}
