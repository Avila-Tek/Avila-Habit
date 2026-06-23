import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { HabitPostgresRepository } from '../../infrastructure/persistent/HabitPostgresRepository';
import { HabitLogPostgresRepository } from '@/modules/habitLog/infrastructure/persistent/HabitLogPostgresRepository';

export interface HabitSummary {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
}

export class GetHabitSummaryUseCase {
  private readonly habitRepo: HabitPostgresRepository;
  private readonly logRepo: HabitLogPostgresRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.habitRepo = new HabitPostgresRepository(db, null as any, null as any);
    this.logRepo = new HabitLogPostgresRepository(db, null as any);
  }

  async execute(userId: string): Promise<HabitSummary> {
    const habits = await this.habitRepo.findByUserId(userId, {
      page: 1,
      perPage: 50,
    });

    let completedToday = 0;
    for (const habit of habits) {
      const logs = await this.logRepo.findByUserId({
        userId,
        habitId: habit.id.value,
        limit: 1,
        offset: 0,
      });
      if (logs[0]?.completed) {
        completedToday++;
      }
    }

    return {
      totalHabits: habits.length,
      completedToday,
      completionRate:
        habits.length > 0
          ? Math.round((completedToday / habits.length) * 100)
          : 0,
    };
  }
}
