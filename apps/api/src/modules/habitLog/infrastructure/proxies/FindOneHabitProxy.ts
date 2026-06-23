import { FastifyInstance } from 'fastify';
import {
  IFindByIdInput,
  IFindOneHabitProxy,
} from '../../application/ports/findOneHabitProxy.port';

export class FindOneHabitProxy implements IFindOneHabitProxy {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async findById({ id, userId }: IFindByIdInput) {
    const findById = this.getAdapters().findById;

    const _input = {
      id,
      userId,
      includeDeleted: false,
    };

    const habit = await findById.execute(_input);

    return {
      isActive: habit.isActive,
      isPaused: habit.status.isPaused(),
      isBlocked: habit.status.isBlocked(),
      goal: habit.goal,
    };
  }

  private getAdapters() {
    return this.fastify.habit.adapters;
  }
}
