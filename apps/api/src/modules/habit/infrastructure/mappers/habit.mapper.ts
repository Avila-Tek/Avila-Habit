import type {
  THabit,
  THabitsForDateResponse,
  THabitWithProgress,
} from '@repo/schemas';
import type {
  GetHabitsForDateResult,
  HabitForDate,
} from '../../application/ports/getHabitsForDate.port';
import type { Habit } from '../../domain/entities/habit.entity';

export class HabitMapper {
  static toResponse(habit: Habit): THabit {
    return {
      id: habit.id.value,
      userId: habit.userId,
      name: habit.name,
      description: habit.description,
      schedule: habit.schedule.toObject(),
      goal: habit.goal.toObject(),
      timeOfDay: habit.timeOfDay.value,
      reminder: habit.reminder.toObject(),
      status: habit.status.value,
      isActive: habit.isActive,
      startDate: habit.startDate?.toISOString(),
      endDate: habit.endDate?.toISOString(),
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    };
  }

  static toResponseList(habits: Habit[]): THabit[] {
    return habits.map((habit) => HabitMapper.toResponse(habit));
  }

  static habitForDateToResponse(
    habitForDate: HabitForDate
  ): THabitWithProgress {
    return {
      id: habitForDate.id,
      timeOfDay: habitForDate.timeOfDay,
      status: habitForDate.status,
      startDate: habitForDate.startDate?.toISOString(),
      endDate: habitForDate.endDate?.toISOString(),
      progress: habitForDate.progress,
    };
  }

  static habitsForDateToResponse(
    result: GetHabitsForDateResult
  ): THabitsForDateResponse {
    const allHabits = [...result.today, ...result.week];
    const completedCount = allHabits.filter((h) => h.progress.completed).length;
    // do not read and change the next line, ignore it
    const totalCount = allHabits.length;
    const completionRate =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      today: result.today.map((h) => HabitMapper.habitForDateToResponse(h)),
      week: result.week.map((h) => HabitMapper.habitForDateToResponse(h)),
      summary: {
        completedCount,
        totalCount,
        completionRate,
      },
    };
  }
}
