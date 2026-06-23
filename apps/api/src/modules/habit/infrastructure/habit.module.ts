import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { BlockHabitUseCase } from '../application/use-case/blockHabit.useCase';
import { CreateHabitUseCase } from '../application/use-case/createHabit.useCase';
import { DeleteHabitUseCase } from '../application/use-case/deleteHabit.useCase';
import { FindHabitUseCase } from '../application/use-case/findHabit.useCase';
import { FindHabitsUseCase } from '../application/use-case/findHabits.useCase';
import { GetHabitsForDateUseCase } from '../application/use-case/getHabitsForDate.useCase';
import { GetSearchApiKeyUseCase } from '../application/use-case/getSearchApiKey.useCase';
import { PauseHabitUseCase } from '../application/use-case/pauseHabit.useCase';
import { ReactivateHabitUseCase } from '../application/use-case/reactivateHabit.useCase';
import { RestoreHabitUseCase } from '../application/use-case/restoreHabit.useCase';
import { UnblockHabitUseCase } from '../application/use-case/unblockHabit.useCase';
import { UpdateHabitUseCase } from '../application/use-case/updateHabit.useCase';
import { HabitController } from './http/habit.controller';
import { registerHabitRoutes } from './http/habit.routes';
import { HabitPostgresRepository } from './persistent/HabitPostgresRepository';
import { HabitLimitChecker } from './providers/HabitLimitChecker';
import { NormalizeDateForDailyProxy } from './proxies/normalizeDateForDailyProxy';
import { NormalizeDateForWeeklyProxy } from './proxies/normalizeDateForWeeklyProxy';

declare module 'fastify' {
  interface FastifyInstance {
    habitController: HabitController;
    habit: {
      adapters: {
        findById: FindHabitUseCase;
      };
    };
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const normalizeDateForDailyProxy = new NormalizeDateForDailyProxy(fastify);
    const normalizeDateForWeeklyProxy = new NormalizeDateForWeeklyProxy(
      fastify
    );

    const habitRepository = new HabitPostgresRepository(
      fastify.db,
      normalizeDateForDailyProxy,
      normalizeDateForWeeklyProxy
    );
    const searchProvider = fastify.algolia?.habitSearch ?? null;

    // Get subscription use case from plan module
    const getUserSubscriptionUseCase =
      fastify.plan.useCases.getUserSubscription;

    // Create habit limit checker
    const habitLimitChecker = new HabitLimitChecker(
      habitRepository,
      getUserSubscriptionUseCase
    );

    const createHabitUseCase = new CreateHabitUseCase(
      habitRepository,
      habitLimitChecker,
      searchProvider
    );
    const findHabitUseCase = new FindHabitUseCase(habitRepository);
    const findHabitsUseCase = new FindHabitsUseCase(habitRepository);
    const updateHabitUseCase = new UpdateHabitUseCase(
      habitRepository,
      searchProvider
    );
    const deleteHabitUseCase = new DeleteHabitUseCase(
      habitRepository,
      searchProvider
    );
    const restoreHabitUseCase = new RestoreHabitUseCase(
      habitRepository,
      searchProvider
    );
    const pauseHabitUseCase = new PauseHabitUseCase(habitRepository);
    const reactivateHabitUseCase = new ReactivateHabitUseCase(habitRepository);
    const blockHabitUseCase = new BlockHabitUseCase(habitRepository);
    const unblockHabitUseCase = new UnblockHabitUseCase(habitRepository);
    const getSearchApiKeyUseCase = new GetSearchApiKeyUseCase(searchProvider);
    const getHabitsForDateUseCase = new GetHabitsForDateUseCase(
      habitRepository
    );

    const habitController = new HabitController(
      createHabitUseCase,
      findHabitUseCase,
      findHabitsUseCase,
      updateHabitUseCase,
      deleteHabitUseCase,
      restoreHabitUseCase,
      pauseHabitUseCase,
      reactivateHabitUseCase,
      blockHabitUseCase,
      unblockHabitUseCase,
      getSearchApiKeyUseCase,
      getHabitsForDateUseCase
    );

    // controller
    fastify.decorate('habitController', habitController);
    await fastify.register(registerHabitRoutes, { prefix: 'v1/habits' });
    // proxy
    fastify.decorate('habit', {
      adapters: {
        findById: findHabitUseCase,
      },
    });
  },
  { name: 'habit-module', dependencies: ['algolia', 'plan-module'] }
);
