import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type {
  IPauseHabitUseCase,
  PauseHabitCommand,
} from '../ports/pauseHabit.port';

export class PauseHabitUseCase implements IPauseHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(command: PauseHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    habit.pause();

    return await this.habitRepository.update(habit);
  }
}
