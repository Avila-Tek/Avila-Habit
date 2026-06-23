import type { TGoalPeriod } from '@repo/schemas';
import { HabitLogId } from '../value-objects';

export interface HabitLogProps {
  id: HabitLogId;
  userId: string;
  habitId: string;
  logDate: Date;
  completed: boolean;
  completedAt?: Date;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitLogProps {
  id: HabitLogId;
  userId: string;
  habitId: string;
  logDate: Date;
  goalPeriod: TGoalPeriod;
  completed: boolean;
  completedAt?: Date;
  value: number;
}

export class HabitLog {
  private _completed: boolean;
  private _completedAt?: Date;
  private _value: number;
  private _updatedAt: Date;

  private constructor(private readonly props: HabitLogProps) {
    this._completed = props.completed;
    this._completedAt = props.completedAt;
    this._value = props.value;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateHabitLogProps): HabitLog {
    const now = new Date();
    return new HabitLog({
      ...props,
      logDate: HabitLog.normalizeDateForPeriod(props.logDate, props.goalPeriod),
      createdAt: now,
      updatedAt: now,
    });
  }

  static normalizeToMidnight(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  }

  static getWeekRange(date: Date): { start: Date; end: Date } {
    const normalized = HabitLog.normalizeToMidnight(date);
    const dayOfWeek = normalized.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(normalized);
    monday.setUTCDate(normalized.getUTCDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    return { start: monday, end: sunday };
  }

  static normalizeDateForPeriod(date: Date, goalPeriod: TGoalPeriod): Date {
    if (goalPeriod === 'week') {
      return HabitLog.getWeekRange(date).start;
    }
    return HabitLog.normalizeToMidnight(date);
  }

  static reconstitute(props: HabitLogProps): HabitLog {
    return new HabitLog(props);
  }

  get id(): HabitLogId {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get habitId(): string {
    return this.props.habitId;
  }

  get logDate(): Date {
    return this.props.logDate;
  }

  get completed(): boolean {
    return this._completed;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get value(): number {
    return this._value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  markCompleted(value?: number): void {
    this._completed = true;
    this._completedAt = new Date();
    if (value !== undefined) {
      this._value = value;
    }
    this.touch();
  }

  updateValue(value: number, habitGoal: number): void {
    if (value < 0) {
      throw new Error('Value must be non-negative');
    }

    if (value > habitGoal) {
      this._value = habitGoal;
    } else {
      this._value = value;
    }
    this.touch();
  }
}
