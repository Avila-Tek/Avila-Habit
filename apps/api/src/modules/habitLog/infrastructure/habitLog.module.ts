import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { FindHabitLogsUseCase } from '../application/use-case/findHabitLogs.useCase';
import { UpsertHabitLogUseCase } from '../application/use-case/upsertHabitLog.useCase';
import { HabitLog } from '../domain';
import { HabitLogController } from './http/habitLog.controller';
import { registerHabitLogRoutes } from './http/habitLog.routes';
import { HabitLogPostgresRepository } from './persistent/HabitLogPostgresRepository';
import { FindOneHabitProxy } from './proxies/FindOneHabitProxy';

declare module 'fastify' {
  interface FastifyInstance {
    habitLogController: HabitLogController;
    habitLog: {
      adapters: {
        normalizeToMidnight: typeof HabitLog.normalizeToMidnight;
        getWeekRange: typeof HabitLog.getWeekRange;
      };
    };
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const findOneHabitProxy = new FindOneHabitProxy(fastify);
    const habitLogRepository = new HabitLogPostgresRepository(
      fastify.db,
      findOneHabitProxy
    );

    const upsertHabitLogUseCase = new UpsertHabitLogUseCase(
      habitLogRepository,
      findOneHabitProxy
    );
    const findHabitLogsUseCase = new FindHabitLogsUseCase(habitLogRepository);

    const habitLogController = new HabitLogController(
      upsertHabitLogUseCase,
      findHabitLogsUseCase
    );

    // controller
    fastify.decorate('habitLogController', habitLogController);
    await fastify.register(registerHabitLogRoutes, { prefix: 'v1/habit-logs' });
    // proxy
    fastify.decorate('habitLog', {
      adapters: {
        normalizeToMidnight: HabitLog.normalizeToMidnight,
        getWeekRange: HabitLog.getWeekRange,
      },
    });
  },
  { name: 'habit-log-module' }
);
