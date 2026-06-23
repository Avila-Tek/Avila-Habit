import type { Habit } from '../../domain/entities/habit.entity';

export interface UnblockHabitCommand {
  id: string;
  userId: string;
}

export interface IUnblockHabitUseCase {
  execute(command: UnblockHabitCommand): Promise<Habit>;
}
