import type { THabitLog } from '@repo/schemas';
import type { HabitLog } from '../../domain/entities/habitLog.entity';

export class HabitLogMapper {
  static toResponse(habitLog: HabitLog): THabitLog {
    return {
      id: habitLog.id.value,
      userId: habitLog.userId,
      habitId: habitLog.habitId,
      logDate: habitLog.logDate.toISOString(),
      completed: habitLog.completed,
      completedAt: habitLog.completedAt?.toISOString(),
      value: habitLog.value,
      createdAt: habitLog.createdAt.toISOString(),
      updatedAt: habitLog.updatedAt.toISOString(),
    };
  }

  static toResponseList(habitLogs: HabitLog[]): THabitLog[] {
    return habitLogs.map((habitLog) => HabitLogMapper.toResponse(habitLog));
  }
}
