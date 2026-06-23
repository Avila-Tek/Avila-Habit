import type { HabitLog } from '../../domain/entities/habitLog.entity';

export interface FindHabitLogsQuery {
  userId: string;
  habitId?: string;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
}

export interface IFindHabitLogsUseCase {
  execute(query: FindHabitLogsQuery): Promise<HabitLog[]>;
}
