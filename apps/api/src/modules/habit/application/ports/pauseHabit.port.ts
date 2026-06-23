import type { Habit } from '../../domain/entities/habit.entity';

export interface PauseHabitCommand {
  id: string;
  userId: string;
}

export interface IPauseHabitUseCase {
  execute(command: PauseHabitCommand): Promise<Habit>;
}
