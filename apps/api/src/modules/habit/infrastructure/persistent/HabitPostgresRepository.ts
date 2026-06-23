import type { TPaginationInput } from '@repo/schemas';
import { GOAL_PERIOD } from '@repo/schemas';
import {
  and,
  arrayContains,
  count,
  desc,
  eq,
  gte,
  lte,
  SQL,
} from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { habitLogs, habits } from '@/database';
import type {
  CreateHabitInput,
  FindHabitsForDateFilters,
  IHabitRepository,
} from '../../application/ports/habitRepository.port';
import { Habit } from '../../domain/entities/habit.entity';
import { HabitInProgress } from '../../domain/entities/habitInProgress.entity';
import { HabitNotFoundError, InvalidHabitDataError } from '../../domain/errors';
import {
  HabitGoal,
  HabitId,
  HabitReminder,
  HabitSchedule,
  HabitStatus,
  TimeOfDay,
} from '../../domain/value-objects';
import { INormalizeDateForDaily } from '../../application/ports/normalizeDateForDaily.port';
import { INormalizeDateForWeekly } from '../../application/ports/normalizeDateForWeekly.port';

type HabitRow = typeof habits.$inferSelect;

export class HabitPostgresRepository implements IHabitRepository {
  private normalizeDateForDailyProxy: INormalizeDateForDaily;
  private normalizeDateForWeeklyProxy: INormalizeDateForWeekly;
  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    normalizeDateForDailyProxy: INormalizeDateForDaily,
    normalizeDateForWeeklyProxy: INormalizeDateForWeekly
  ) {
    this.normalizeDateForDailyProxy = normalizeDateForDailyProxy;
    this.normalizeDateForWeeklyProxy = normalizeDateForWeeklyProxy;
  }

  private buildWhere(
    userId?: string,
    includeDeleted = false,
    id?: string
  ): SQL | undefined {
    const conditions: (SQL | undefined)[] = [];

    if (!includeDeleted) {
      conditions.push(eq(habits.isActive, true));
    }

    if (userId) {
      conditions.push(eq(habits.userId, userId));
    }

    if (id) {
      conditions.push(eq(habits.id, id));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private toDomain(raw: HabitRow): Habit {
    return Habit.reconstitute({
      id: HabitId.create(raw.id),
      userId: raw.userId,
      name: raw.name,
      description: raw.description ?? undefined,
      schedule: HabitSchedule.create({
        type: raw.scheduleType,
        daysOfWeek: raw.scheduleDaysOfWeek ?? undefined,
        weeklyDay: raw.scheduleWeeklyDay ?? undefined,
        weeklyFlexible: raw.scheduleWeeklyFlexible,
      }),
      goal: HabitGoal.create({
        unit: raw.goalUnit,
        period: raw.goalPeriod,
        target: raw.goalTarget,
      }),
      timeOfDay: TimeOfDay.create(raw.timeOfDay),
      reminder: HabitReminder.create({
        enabled: raw.reminderEnabled,
        time: raw.reminderTime ?? undefined,
      }),
      status: HabitStatus.create(raw.status),
      isActive: raw.isActive,
      startDate: raw.startDate ?? undefined,
      endDate: raw.endDate ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private filterByCompletedStatus(
    results: Array<{
      habit: HabitRow;
      log: typeof habitLogs.$inferSelect | null;
    }>,
    completed?: boolean
  ): Array<{ habit: HabitRow; log: typeof habitLogs.$inferSelect | null }> {
    if (completed === undefined) {
      return results;
    }

    return results.filter((result) => {
      if (completed === false) {
        return result.log?.completed === false || result.log === null;
      }
      return result.log?.completed === true;
    });
  }

  async findById(id: string, includeDeleted = false): Promise<Habit | null> {
    const [row] = await this.db
      .select()
      .from(habits)
      .where(this.buildWhere(undefined, includeDeleted, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findByUserId(
    userId: string,
    params: TPaginationInput & { includeDeleted?: boolean }
  ): Promise<Habit[]> {
    const skip = (params.page - 1) * params.perPage;

    const rows = await this.db
      .select()
      .from(habits)
      .where(this.buildWhere(userId, params.includeDeleted))
      .orderBy(desc(habits.createdAt))
      .offset(skip)
      .limit(params.perPage);

    return rows.map((row) => this.toDomain(row));
  }

  async count(userId: string, includeDeleted = false): Promise<number> {
    const [result] = await this.db
      .select({ value: count() })
      .from(habits)
      .where(this.buildWhere(userId, includeDeleted));

    return Number(result?.value ?? 0);
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: habits.id })
      .from(habits)
      .where(eq(habits.id, id))
      .limit(1);

    return Boolean(row);
  }

  async create(data: CreateHabitInput): Promise<Habit> {
    HabitSchedule.create({
      type: data.schedule.type,
      daysOfWeek: data.schedule.daysOfWeek,
      weeklyDay: data.schedule.weeklyDay,
      weeklyFlexible: data.schedule.weeklyFlexible,
    });
    HabitGoal.create({
      unit: data.goal.unit,
      period: data.goal.period,
      target: data.goal.target,
    });
    TimeOfDay.create(data.timeOfDay);
    HabitReminder.create({
      enabled: data.reminder.enabled,
      time: data.reminder.time,
    });

    const [row] = await this.db
      .insert(habits)
      .values({
        userId: data.userId,
        name: data.name,
        description: data.description,
        scheduleType: data.schedule.type,
        scheduleDaysOfWeek: data.schedule.daysOfWeek,
        scheduleWeeklyDay: data.schedule.weeklyDay,
        scheduleWeeklyFlexible: data.schedule.weeklyFlexible,
        goalUnit: data.goal.unit,
        goalPeriod: data.goal.period,
        goalTarget: data.goal.target,
        timeOfDay: data.timeOfDay,
        reminderEnabled: data.reminder.enabled,
        reminderTime: data.reminder.time,
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .returning();

    if (!row) {
      throw new InvalidHabitDataError('Failed to create habit');
    }

    return this.toDomain(row);
  }

  async update(habit: Habit): Promise<Habit> {
    const scheduleData = habit.schedule.toObject();
    const goalData = habit.goal.toObject();
    const reminderData = habit.reminder.toObject();

    const [row] = await this.db
      .update(habits)
      .set({
        name: habit.name,
        description: habit.description,
        scheduleType: scheduleData.type,
        scheduleDaysOfWeek: scheduleData.daysOfWeek,
        scheduleWeeklyDay: scheduleData.weeklyDay,
        scheduleWeeklyFlexible: scheduleData.weeklyFlexible,
        goalUnit: goalData.unit,
        goalPeriod: goalData.period,
        goalTarget: goalData.target,
        timeOfDay: habit.timeOfDay.value,
        reminderEnabled: reminderData.enabled,
        reminderTime: reminderData.time,
        status: habit.status.value,
        isActive: habit.isActive,
        startDate: habit.startDate,
        endDate: habit.endDate,
        updatedAt: habit.updatedAt,
      })
      .where(eq(habits.id, habit.id.value))
      .returning();

    if (!row) {
      throw new HabitNotFoundError(habit.id.value);
    }

    return this.toDomain(row);
  }

  async hardDelete(id: string): Promise<void> {
    await this.db.delete(habits).where(eq(habits.id, id));
  }

  async findHabitsWithLogsForDate(
    filters: FindHabitsForDateFilters
  ): Promise<HabitInProgress[]> {
    const normalizedDate =
      this.normalizeDateForDailyProxy.normalizeDateForDaily(filters.date);
    const { start: weekStart, end: weekEnd } =
      this.normalizeDateForWeeklyProxy.normalizeDateForWeekly(filters.date);

    const baseConditions: (SQL | undefined)[] = [
      eq(habits.userId, filters.userId),
      eq(habits.isActive, true),
    ];

    if (filters.timeOfDay) {
      baseConditions.push(eq(habits.timeOfDay, filters.timeOfDay));
    }

    if (filters.status) {
      baseConditions.push(eq(habits.status, filters.status));
    }

    if (filters.day !== undefined) {
      baseConditions.push(
        arrayContains(habits.scheduleDaysOfWeek, [filters.day])
      );
    }

    const dailyHabits = await this.db
      .select({
        habit: habits,
        log: habitLogs,
      })
      .from(habits)
      .leftJoin(
        habitLogs,
        and(
          eq(habitLogs.habitId, habits.id),
          eq(habitLogs.userId, filters.userId),
          eq(habitLogs.logDate, normalizedDate)
        )
      )
      .where(and(eq(habits.goalPeriod, GOAL_PERIOD.DAY), ...baseConditions));

    const weeklyHabits = await this.db
      .select({
        habit: habits,
        log: habitLogs,
      })
      .from(habits)
      .leftJoin(
        habitLogs,
        and(
          eq(habitLogs.habitId, habits.id),
          eq(habitLogs.userId, filters.userId),
          gte(habitLogs.logDate, weekStart),
          lte(habitLogs.logDate, weekEnd)
        )
      )
      .where(and(eq(habits.goalPeriod, GOAL_PERIOD.WEEK), ...baseConditions));

    const allResults = [...dailyHabits, ...weeklyHabits];

    const filteredResults = this.filterByCompletedStatus(
      allResults,
      filters.completed
    );

    return filteredResults.map((result) => ({
      habit: this.toDomain(result.habit),
      log: result.log
        ? {
            value: result.log.value,
            completed: result.log.completed,
          }
        : null,
    }));
  }
}
