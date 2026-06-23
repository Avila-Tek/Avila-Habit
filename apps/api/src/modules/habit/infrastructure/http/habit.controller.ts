import type {
  TCreateHabitInput,
  TGetHabitsForDateQuery,
  THabitIdParams,
  TPaginationInput,
  TUpdateHabitInput,
} from '@repo/schemas';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IBlockHabitUseCase } from '../../application/ports/blockHabit.port';
import type { ICreateHabitUseCase } from '../../application/ports/createHabit.port';
import type { IDeleteHabitUseCase } from '../../application/ports/deleteHabit.port';
import type { IFindHabitUseCase } from '../../application/ports/findHabit.port';
import type { IFindHabitsUseCase } from '../../application/ports/findHabits.port';
import type { IGetHabitsForDateUseCase } from '../../application/ports/getHabitsForDate.port';
import type { IGetSearchApiKeyUseCase } from '../../application/ports/getSearchApiKey.port';
import type { IPauseHabitUseCase } from '../../application/ports/pauseHabit.port';
import type { IReactivateHabitUseCase } from '../../application/ports/reactivateHabit.port';
import type { IRestoreHabitUseCase } from '../../application/ports/restoreHabit.port';
import type { IUnblockHabitUseCase } from '../../application/ports/unblockHabit.port';
import type { IUpdateHabitUseCase } from '../../application/ports/updateHabit.port';
import { HabitMapper } from '../mappers/habit.mapper';

export class HabitController {
  constructor(
    private readonly createHabitUseCase: ICreateHabitUseCase,
    private readonly findHabitUseCase: IFindHabitUseCase,
    private readonly findHabitsUseCase: IFindHabitsUseCase,
    private readonly updateHabitUseCase: IUpdateHabitUseCase,
    private readonly deleteHabitUseCase: IDeleteHabitUseCase,
    private readonly restoreHabitUseCase: IRestoreHabitUseCase,
    private readonly pauseHabitUseCase: IPauseHabitUseCase,
    private readonly reactivateHabitUseCase: IReactivateHabitUseCase,
    private readonly blockHabitUseCase: IBlockHabitUseCase,
    private readonly unblockHabitUseCase: IUnblockHabitUseCase,
    private readonly getSearchApiKeyUseCase: IGetSearchApiKeyUseCase,
    private readonly getHabitsForDateUseCase: IGetHabitsForDateUseCase
  ) {
    this.createOne = this.createOne.bind(this);
    this.findOne = this.findOne.bind(this);
    this.findMany = this.findMany.bind(this);
    this.updateOne = this.updateOne.bind(this);
    this.deleteOne = this.deleteOne.bind(this);
    this.restoreOne = this.restoreOne.bind(this);
    this.pauseOne = this.pauseOne.bind(this);
    this.reactivateOne = this.reactivateOne.bind(this);
    this.blockOne = this.blockOne.bind(this);
    this.unblockOne = this.unblockOne.bind(this);
    this.getSearchApiKey = this.getSearchApiKey.bind(this);
    this.getForDate = this.getForDate.bind(this);
  }

  async createOne(
    request: FastifyRequest<{ Body: TCreateHabitInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.createHabitUseCase.execute({
      userId: user.id.value,
      name: request.body.name,
      description: request.body.description,
      schedule: request.body.schedule,
      goal: request.body.goal,
      timeOfDay: request.body.timeOfDay,
      reminder: request.body.reminder,
      startDate: request.body.startDate,
      endDate: request.body.endDate,
    });

    reply.status(201).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async findOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.findHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async findMany(
    request: FastifyRequest<{ Querystring: TPaginationInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;
    const page = request.query.page ?? 1;
    const perPage = request.query.perPage ?? 10;

    const result = await this.findHabitsUseCase.execute({
      userId: user.id.value,
      page,
      perPage,
    });

    reply.status(200).send({
      success: true,
      data: {
        items: HabitMapper.toResponseList(result.items),
        pageInfo: result.pageInfo,
      },
    });
  }

  async updateOne(
    request: FastifyRequest<{
      Params: THabitIdParams;
      Body: TUpdateHabitInput;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.updateHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
      ...request.body,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async deleteOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.deleteHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async restoreOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.restoreHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async pauseOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.pauseHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async reactivateOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.reactivateHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async blockOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.blockHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async unblockOne(
    request: FastifyRequest<{ Params: THabitIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const habit = await this.unblockHabitUseCase.execute({
      id: request.params.id,
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.toResponse(habit),
    });
  }

  async getSearchApiKey(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const result = this.getSearchApiKeyUseCase.execute({
      userId: user.id.value,
    });

    reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async getForDate(
    request: FastifyRequest<{ Querystring: TGetHabitsForDateQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (
      request as FastifyRequest & { user: { id: { value: string } } }
    ).user;

    const result = await this.getHabitsForDateUseCase.execute({
      userId: user.id.value,
      date: request.query.date,
      timeOfDay: request.query.timeOfDay,
      day: request.query.day,
      completed: request.query.completed,
      status: request.query.status,
    });

    reply.status(200).send({
      success: true,
      data: HabitMapper.habitsForDateToResponse(result),
    });
  }
}
