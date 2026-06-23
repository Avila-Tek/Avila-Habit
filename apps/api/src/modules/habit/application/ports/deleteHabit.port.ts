import type { Habit } from '../../domain/entities/habit.entity';

export interface DeleteHabitCommand {
  id: string;
  userId: string;
}

export interface IDeleteHabitUseCase {
  execute(command: DeleteHabitCommand): Promise<Habit>;
}
