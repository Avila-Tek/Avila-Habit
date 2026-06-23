import type { Habit } from '../../domain/entities/habit.entity';

export interface RestoreHabitCommand {
  id: string;
  userId: string;
}

export interface IRestoreHabitUseCase {
  execute(command: RestoreHabitCommand): Promise<Habit>;
}
