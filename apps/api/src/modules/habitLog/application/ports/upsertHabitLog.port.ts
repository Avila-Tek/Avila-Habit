import type { HabitLog } from '../../domain/entities/habitLog.entity';

export interface UpsertHabitLogCommand {
  userId: string;
  habitId: string;
  logDate: Date;
  value: number;
}

export interface IUpsertHabitLogUseCase {
  execute(command: UpsertHabitLogCommand): Promise<HabitLog>;
}
