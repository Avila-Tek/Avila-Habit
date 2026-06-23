import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type {
  FindHabitQuery,
  IFindHabitUseCase,
} from '../ports/findHabit.port';
import type { IHabitRepository } from '../ports/habitRepository.port';

export class FindHabitUseCase implements IFindHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(query: FindHabitQuery): Promise<Habit> {
    const habit = await this.habitRepository.findById(
      query.id,
      query.includeDeleted
    );

    if (!habit) {
      throw new HabitNotFoundError(query.id);
    }

    if (query.userId && habit.userId !== query.userId) {
      throw new HabitNotFoundError(query.id);
    }

    return habit;
  }
}
