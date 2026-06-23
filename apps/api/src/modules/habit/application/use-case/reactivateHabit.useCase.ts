import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type {
  IReactivateHabitUseCase,
  ReactivateHabitCommand,
} from '../ports/reactivateHabit.port';

export class ReactivateHabitUseCase implements IReactivateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(command: ReactivateHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    habit.reactivate();

    return await this.habitRepository.update(habit);
  }
}
