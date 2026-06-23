import {
  assignRoleInput,
  paginationInputSchema,
  userDocs,
  userIdParamsSchema,
} from '@repo/schemas';
import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requirePermission } from '@/plugins/routes/middlewares/permissions.middleware';

export const registerUserRoutes: FastifyPluginAsyncZod = async function (
  fastify: FastifyInstance
): Promise<void> {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      ...userDocs.findMany,
      querystring: paginationInputSchema,
    },
    handler: fastify.userController.findMany,
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: userDocs.findOne,
    handler: fastify.userController.findOne,
  });

  fastify.route({
    method: 'PATCH',
    url: '/:id',
    schema: userDocs.updateOne,
    handler: fastify.userController.updateOne,
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: userDocs.deleteOne,
    handler: fastify.userController.deleteOne,
  });

  fastify.route({
    method: 'PATCH',
    url: '/:id/role',
    schema: {
      params: userIdParamsSchema,
      body: assignRoleInput,
      description: 'Assign a role to a user (Admin only)',
      tags: ['users'],
    },
    preHandler: requirePermission({ permissionCode: 'user:update:any' }),
    handler: fastify.userController.assignRole,
  });
};
