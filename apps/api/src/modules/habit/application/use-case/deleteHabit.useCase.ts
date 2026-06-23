import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type {
  DeleteHabitCommand,
  IDeleteHabitUseCase,
} from '../ports/deleteHabit.port';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type { IHabitSearchProvider } from '../ports/habitSearchProvider.port';

export class DeleteHabitUseCase implements IDeleteHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly searchProvider?: IHabitSearchProvider | null
  ) {}

  async execute(command: DeleteHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    habit.softDelete();

    const deletedHabit = await this.habitRepository.update(habit);

    if (this.searchProvider) {
      try {
        await this.searchProvider.updateHabitIndex(deletedHabit);
      } catch (err) {
        console.error('Failed to update deleted habit in search index:', err);
      }
    }

    return deletedHabit;
  }
}
