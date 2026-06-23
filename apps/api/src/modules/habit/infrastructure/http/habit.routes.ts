import {
  createHabitInput,
  getHabitsForDateQuerySchema,
  habitIdParamsSchema,
  paginationInputSchema,
  updateHabitInput,
} from '@repo/schemas';
import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const registerHabitRoutes: FastifyPluginAsyncZod = async function (
  fastify: FastifyInstance
): Promise<void> {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: createHabitInput,
      tags: ['habits'],
    },
    handler: fastify.habitController.createOne,
  });

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: paginationInputSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.findMany,
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.findOne,
  });

  fastify.route({
    method: 'PATCH',
    url: '/:id',
    schema: {
      params: habitIdParamsSchema,
      body: updateHabitInput,
      tags: ['habits'],
    },
    handler: fastify.habitController.updateOne,
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.deleteOne,
  });

  fastify.route({
    method: 'POST',
    url: '/:id/restore',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.restoreOne,
  });

  fastify.route({
    method: 'POST',
    url: '/:id/pause',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.pauseOne,
  });

  fastify.route({
    method: 'POST',
    url: '/:id/reactivate',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.reactivateOne,
  });

  fastify.route({
    method: 'POST',
    url: '/:id/block',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.blockOne,
  });

  fastify.route({
    method: 'POST',
    url: '/:id/unblock',
    schema: {
      params: habitIdParamsSchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.unblockOne,
  });

  fastify.route({
    method: 'GET',
    url: '/search-key',
    schema: {
      tags: ['habits'],
    },
    handler: fastify.habitController.getSearchApiKey,
  });

  fastify.route({
    method: 'GET',
    url: '/for-date',
    schema: {
      querystring: getHabitsForDateQuerySchema,
      tags: ['habits'],
    },
    handler: fastify.habitController.getForDate,
  });
};
