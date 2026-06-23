import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type {
  IUnblockHabitUseCase,
  UnblockHabitCommand,
} from '../ports/unblockHabit.port';

export class UnblockHabitUseCase implements IUnblockHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(command: UnblockHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    habit.unblock();

    return await this.habitRepository.update(habit);
  }
}
