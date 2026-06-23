import { GOAL_PERIOD } from '@repo/schemas';
import { and, desc, eq, gte, lte, SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { habitLogs, habits } from '@/database';
import { Habit } from '@/modules/habit/domain/entities/habit.entity';
import type {
  CreateHabitLogInput,
  FindHabitLogsInput,
  IHabitLogRepository,
} from '../../application/ports/habitLogRepository.port';
import { HabitLog } from '../../domain/entities/habitLog.entity';
import { HabitLogId } from '../../domain/value-objects';
import { IFindOneHabitProxy } from '../../application/ports/findOneHabitProxy.port';

type HabitLogRow = typeof habitLogs.$inferSelect;

export class HabitLogPostgresRepository implements IHabitLogRepository {
  private findOneHabitProxy: IFindOneHabitProxy;
  private habitCache: Map<string, Habit> = new Map();

  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    findOneHabitProxy: IFindOneHabitProxy
  ) {
    this.findOneHabitProxy = findOneHabitProxy;
  }

  private toDomain(raw: HabitLogRow): HabitLog {
    return HabitLog.reconstitute({
      id: HabitLogId.create(raw.id),
      userId: raw.userId,
      habitId: raw.habitId,
      logDate: raw.logDate,
      completed: raw.completed,
      completedAt: raw.completedAt ?? undefined,
      value: raw.value,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private buildWhere(params: {
    userId?: string;
    habitId?: string;
    logDate?: Date;
    startDate?: Date;
    endDate?: Date;
  }): SQL | undefined {
    const conditions: (SQL | undefined)[] = [];

    if (params.userId) {
      conditions.push(eq(habitLogs.userId, params.userId));
    }

    if (params.habitId) {
      conditions.push(eq(habitLogs.habitId, params.habitId));
    }

    if (params.logDate) {
      conditions.push(eq(habitLogs.logDate, params.logDate));
    }

    if (params.startDate) {
      conditions.push(gte(habitLogs.logDate, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(habitLogs.logDate, params.endDate));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async findById(id: string): Promise<HabitLog | null> {
    const [row] = await this.db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findByHabitIdForPeriod(
    habitId: string,
    logDate: Date
  ): Promise<HabitLog | null> {
    // find habit
    const habit = await this.findOneHabitProxy.findById({
      id: habitId,
    });

    let whereCondition: SQL | undefined;

    if (habit.goal.period === GOAL_PERIOD.DAY) {
      // for daily period, must exist just 1 habit log by current day
      const normalizedDate = HabitLog.normalizeToMidnight(logDate);
      whereCondition = this.buildWhere({
        habitId,
        logDate: normalizedDate,
      });
    } else {
      // for weekly, must exist just 1 habit log by week
      const { start, end } = HabitLog.getWeekRange(logDate);
      whereCondition = this.buildWhere({
        habitId,
        startDate: start,
        endDate: end,
      });
    }

    const [row] = await this.db
      .select()
      .from(habitLogs)
      .where(whereCondition)
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findByUserId(params: FindHabitLogsInput): Promise<HabitLog[]> {
    const rows = await this.db
      .select()
      .from(habitLogs)
      .where(
        this.buildWhere({
          userId: params.userId,
          habitId: params.habitId,
          startDate: params.startDate,
          endDate: params.endDate,
        })
      )
      .orderBy(desc(habitLogs.logDate))
      .offset(params.offset)
      .limit(params.limit);

    const result: HabitLog[] = [];
    for (const row of rows) {
      const [habitRow] = await this.db
        .select()
        .from(habits)
        .where(eq(habits.id, row.habitId))
        .limit(1);
      if (habitRow?.isActive) {
        result.push(this.toDomain(row));
      }
    }
    return result;
  }

  async create(data: CreateHabitLogInput): Promise<HabitLog> {
    const [row] = await this.db
      .insert(habitLogs)
      .values({
        userId: data.userId,
        habitId: data.habitId,
        logDate: data.logDate,
        completed: data.completed,
        completedAt: data.completedAt,
        value: data.value,
      })
      .returning();

    return this.toDomain(row!);
  }

  async update(habitLog: HabitLog): Promise<HabitLog> {
    const [row] = await this.db
      .update(habitLogs)
      .set({
        completed: habitLog.completed,
        completedAt: habitLog.completedAt,
        value: habitLog.value,
        updatedAt: habitLog.updatedAt,
      })
      .where(eq(habitLogs.id, habitLog.id.value))
      .returning();

    return this.toDomain(row!);
  }
}
