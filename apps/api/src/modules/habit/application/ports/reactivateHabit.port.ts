import type { Habit } from '../../domain/entities/habit.entity';

export interface ReactivateHabitCommand {
  id: string;
  userId: string;
}

export interface IReactivateHabitUseCase {
  execute(command: ReactivateHabitCommand): Promise<Habit>;
}
