import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import type {
  BlockHabitCommand,
  IBlockHabitUseCase,
} from '../ports/blockHabit.port';
import type { IHabitRepository } from '../ports/habitRepository.port';

export class BlockHabitUseCase implements IBlockHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(command: BlockHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    habit.block();

    return await this.habitRepository.update(habit);
  }
}
