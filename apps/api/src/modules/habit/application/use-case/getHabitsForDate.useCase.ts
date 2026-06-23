import { GOAL_PERIOD } from '@repo/schemas';
import type {
  GetHabitsForDateQuery,
  GetHabitsForDateResult,
  HabitForDate,
  IGetHabitsForDateUseCase,
} from '../ports/getHabitsForDate.port';
import type { IHabitRepository } from '../ports/habitRepository.port';

export class GetHabitsForDateUseCase implements IGetHabitsForDateUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(query: GetHabitsForDateQuery): Promise<GetHabitsForDateResult> {
    const habitsWithLogs = await this.habitRepository.findHabitsWithLogsForDate(
      {
        userId: query.userId,
        date: query.date,
        timeOfDay: query.timeOfDay,
        day: query.day,
        completed: query.completed,
        status: query.status,
      }
    );

    const today: HabitForDate[] = [];
    const week: HabitForDate[] = [];

    for (const { habit, log } of habitsWithLogs) {
      const scheduleData = habit.schedule.toObject();
      const queryDate = new Date(query.date as unknown as string);
      let shouldInclude = false;
      if (scheduleData.type === 'daily') {
        shouldInclude = true;
      } else if (scheduleData.type === 'weekly') {
        shouldInclude =
          scheduleData.weeklyFlexible === true ||
          scheduleData.weeklyDay === queryDate.getDay();
      } else if (scheduleData.type === 'custom') {
        shouldInclude = (scheduleData.daysOfWeek ?? []).includes(
          queryDate.getDay()
        );
      }
      if (!shouldInclude) continue;

      const goalData = habit.goal.toObject();
      const habitForDate: HabitForDate = {
        id: habit.id.value,
        timeOfDay: habit.timeOfDay.value,
        status: habit.status.value,
        startDate: habit.startDate,
        endDate: habit.endDate,
        progress: {
          unit: goalData.unit,
          period: goalData.period,
          target: goalData.target,
          current: log?.value ?? 0,
          completed: log?.completed ?? false,
        },
      };

      if (goalData.period === GOAL_PERIOD.DAY) {
        today.push(habitForDate);
      } else {
        week.push(habitForDate);
      }
    }

    return {
      today,
      week,
    };
  }
}
