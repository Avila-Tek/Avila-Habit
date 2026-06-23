// import { HabitNotFoundError } from '@/modules/habit/domain/errors';
import { HabitLog } from '../../domain/entities/habitLog.entity';
import {
  HabitNotLoggableError,
  InvalidHabitLogDataError,
} from '../../domain/errors';
import type { IHabitLogRepository } from '../ports/habitLogRepository.port';
import type {
  IUpsertHabitLogUseCase,
  UpsertHabitLogCommand,
} from '../ports/upsertHabitLog.port';
import { IFindOneHabitProxy } from '../ports/findOneHabitProxy.port';

export class UpsertHabitLogUseCase implements IUpsertHabitLogUseCase {
  constructor(
    private readonly habitLogRepository: IHabitLogRepository,
    private readonly findOneHabitProxy: IFindOneHabitProxy
  ) {}

  async execute(command: UpsertHabitLogCommand): Promise<HabitLog> {
    try {
    const _findByIdInput = {
      id: command.habitId,
      userId: command.userId,
    };
    const habit = await this.findOneHabitProxy.findById(_findByIdInput);

    if (!habit.isActive) {
      throw new HabitNotLoggableError('deleted');
    }

    if (habit.isPaused) {
      throw new HabitNotLoggableError('paused');
    }

    if (habit.isBlocked) {
      throw new HabitNotLoggableError('blocked');
    }

    const normalizedLogDate = HabitLog.normalizeDateForPeriod(
      command.logDate,
      habit.goal.period
    );

    const existingLog = await this.habitLogRepository.findByHabitIdForPeriod(
      command.habitId,
      normalizedLogDate
    );

    if (existingLog && existingLog.completed) {
      throw new InvalidHabitLogDataError('El habit log esta completo');
    }

    const goalTarget = habit.goal.target;
    let value = command.value;

    // validate goalTarget limit for create case
    if (!existingLog && value > goalTarget) {
      value = goalTarget;
    }

    // set new value
    if (existingLog) {
      const newHabitLogValue = command.value + existingLog.value;
      existingLog.updateValue(newHabitLogValue, goalTarget);
    }

    // mark as completed;
    if (existingLog && existingLog.value >= goalTarget) {
      existingLog.markCompleted();
    }

    // return response
    if (existingLog) {
      return this.habitLogRepository.update(existingLog);
    }

    const completed = command.value >= goalTarget;
    const habitLog = await this.habitLogRepository.create({
      userId: command.userId,
      habitId: command.habitId,
      logDate: normalizedLogDate,
      completedAt: completed ? new Date() : undefined,
      completed,
      value,
    });

    return habitLog;
    } catch {
      return {} as HabitLog;
    }
  }
}
