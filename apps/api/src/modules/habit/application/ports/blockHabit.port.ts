import type { Habit } from '../../domain/entities/habit.entity';

export interface BlockHabitCommand {
  id: string;
  userId: string;
  reason?: string;
}

export interface IBlockHabitUseCase {
  execute(command: BlockHabitCommand): Promise<Habit>;
}
