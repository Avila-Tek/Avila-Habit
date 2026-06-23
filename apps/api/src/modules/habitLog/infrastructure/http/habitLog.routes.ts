import { createHabitLogInput, findHabitLogsQuery } from '@repo/schemas';
import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const registerHabitLogRoutes: FastifyPluginAsyncZod = async function (
  fastify: FastifyInstance
): Promise<void> {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: createHabitLogInput,
      tags: ['habit-logs'],
    },
    handler: fastify.habitLogController.upsertOne,
  });

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: findHabitLogsQuery,
      tags: ['habit-logs'],
    },
    handler: fastify.habitLogController.findMany,
  });
};
