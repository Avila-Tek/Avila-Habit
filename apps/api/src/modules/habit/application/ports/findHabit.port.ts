import type { Habit } from '../../domain/entities/habit.entity';

export interface FindHabitQuery {
  id: string;
  userId?: string;
  includeDeleted?: boolean;
}

export interface IFindHabitUseCase {
  execute(query: FindHabitQuery): Promise<Habit>;
}
