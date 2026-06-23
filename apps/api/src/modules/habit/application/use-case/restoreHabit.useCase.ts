import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type { IHabitSearchProvider } from '../ports/habitSearchProvider.port';
import type {
  IRestoreHabitUseCase,
  RestoreHabitCommand,
} from '../ports/restoreHabit.port';

export class RestoreHabitUseCase implements IRestoreHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly searchProvider?: IHabitSearchProvider | null
  ) {}

  async execute(command: RestoreHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id, true);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    habit.restore();

    const restoredHabit = await this.habitRepository.update(habit);

    if (this.searchProvider) {
      try {
        await this.searchProvider.updateHabitIndex(restoredHabit);
      } catch (err) {
        console.error('Failed to update restored habit in search index:', err);
      }
    }

    return restoredHabit;
  }
}
