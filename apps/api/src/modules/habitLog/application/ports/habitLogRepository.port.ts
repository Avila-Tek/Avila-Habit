import type { HabitLog } from '../../domain/entities/habitLog.entity';

export interface CreateHabitLogInput {
  userId: string;
  habitId: string;
  logDate: Date;
  completed: boolean;
  completedAt?: Date;
  value: number;
}

export interface FindHabitLogsInput {
  userId: string;
  habitId?: string;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
}

export interface IHabitLogRepository {
  findById(id: string): Promise<HabitLog | null>;
  findByHabitIdForPeriod(
    habitId: string,
    logDate: Date
  ): Promise<HabitLog | null>;
  findByUserId(params: FindHabitLogsInput): Promise<HabitLog[]>;
  create(data: CreateHabitLogInput): Promise<HabitLog>;
  update(habitLog: HabitLog): Promise<HabitLog>;
}
