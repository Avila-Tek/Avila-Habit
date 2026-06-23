import {
  SCHEDULE_TYPE,
  scheduleTypeValues,
  type TScheduleType,
} from '@repo/schemas';
import { InvalidScheduleError } from '../errors/habit.errors';

const VALID_DAYS_RANGE = [0, 1, 2, 3, 4, 5, 6];

export interface HabitScheduleProps {
  type: TScheduleType;
  daysOfWeek?: number[];
  weeklyDay?: number;
  weeklyFlexible?: boolean;
}

export interface HabitScheduleOutput {
  type: TScheduleType;
  daysOfWeek?: number[];
  weeklyDay?: number;
  weeklyFlexible: boolean;
}

export class HabitSchedule {
  private constructor(
    private readonly _type: TScheduleType,
    private readonly _daysOfWeek: number[] | undefined,
    private readonly _weeklyDay: number | undefined,
    private readonly _weeklyFlexible: boolean
  ) {}

  private static validateScheduleType(type: TScheduleType): void {
    if (!scheduleTypeValues.includes(type)) {
      throw new InvalidScheduleError(
        `Invalid schedule type: ${type}. Must be one of: ${scheduleTypeValues.join(', ')}`
      );
    }
  }

  private static validateDaysOfWeek(daysOfWeek: number[] | undefined): void {
    if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      throw new InvalidScheduleError(
        'Custom schedule requires at least one day of week'
      );
    }
    const invalidDays = daysOfWeek.filter(
      (day) => !VALID_DAYS_RANGE.includes(day)
    );
    if (invalidDays.length > 0) {
      throw new InvalidScheduleError(
        `Invalid days of week: ${invalidDays.join(', ')}. Must be between 0 (Sunday) and 6 (Saturday)`
      );
    }
  }

  private static validateWeeklyDay(weeklyDay: number | undefined): void {
    if (weeklyDay === undefined || !VALID_DAYS_RANGE.includes(weeklyDay)) {
      throw new InvalidScheduleError(
        'Weekly schedule requires a valid weekly day (0-6)'
      );
    }
  }

  private static validateDailySchedule(props: HabitScheduleProps): void {
    if (props.daysOfWeek !== undefined) {
      throw new InvalidScheduleError('Daily schedule must not have daysOfWeek');
    }
    if (props.weeklyDay !== undefined) {
      throw new InvalidScheduleError('Daily schedule must not have weeklyDay');
    }
    if (props.weeklyFlexible === true) {
      throw new InvalidScheduleError(
        'weeklyFlexible only applies to weekly schedule'
      );
    }
  }

  private static validateWeeklySchedule(props: HabitScheduleProps): void {
    HabitSchedule.validateWeeklyDay(props.weeklyDay);
    if (props.daysOfWeek !== undefined) {
      throw new InvalidScheduleError(
        'Weekly schedule must not have daysOfWeek'
      );
    }
  }

  private static validateCustomSchedule(props: HabitScheduleProps): void {
    HabitSchedule.validateDaysOfWeek(props.daysOfWeek);
    if (props.weeklyDay !== undefined) {
      throw new InvalidScheduleError('Custom schedule must not have weeklyDay');
    }
    if (props.weeklyFlexible === true) {
      throw new InvalidScheduleError(
        'weeklyFlexible only applies to weekly schedule'
      );
    }
  }

  private static validateProps(props: HabitScheduleProps): void {
    HabitSchedule.validateScheduleType(props.type);

    switch (props.type) {
      case SCHEDULE_TYPE.DAILY:
        HabitSchedule.validateDailySchedule(props);
        break;
      case SCHEDULE_TYPE.WEEKLY:
        HabitSchedule.validateWeeklySchedule(props);
        break;
      case SCHEDULE_TYPE.CUSTOM:
        HabitSchedule.validateCustomSchedule(props);
        break;
    }
  }

  static create(props: HabitScheduleProps): HabitSchedule {
    HabitSchedule.validateProps(props);

    return new HabitSchedule(
      props.type,
      props.type === SCHEDULE_TYPE.CUSTOM
        ? [...new Set(props.daysOfWeek)].sort()
        : undefined,
      props.type === SCHEDULE_TYPE.WEEKLY ? props.weeklyDay : undefined,
      props.type === SCHEDULE_TYPE.WEEKLY
        ? (props.weeklyFlexible ?? false)
        : false
    );
  }

  static daily(): HabitSchedule {
    return new HabitSchedule(SCHEDULE_TYPE.DAILY, undefined, undefined, false);
  }

  static weekly(day: number, flexible = false): HabitSchedule {
    return HabitSchedule.create({
      type: SCHEDULE_TYPE.WEEKLY,
      weeklyDay: day,
      weeklyFlexible: flexible,
    });
  }

  static custom(daysOfWeek: number[]): HabitSchedule {
    return HabitSchedule.create({
      type: SCHEDULE_TYPE.CUSTOM,
      daysOfWeek,
      weeklyFlexible: false,
    });
  }

  get type(): TScheduleType {
    return this._type;
  }

  get daysOfWeek(): number[] | undefined {
    return this._daysOfWeek ? [...this._daysOfWeek] : undefined;
  }

  get weeklyDay(): number | undefined {
    return this._weeklyDay;
  }

  get weeklyFlexible(): boolean {
    return this._weeklyFlexible;
  }

  isDaily(): boolean {
    return this._type === SCHEDULE_TYPE.DAILY;
  }

  isWeekly(): boolean {
    return this._type === SCHEDULE_TYPE.WEEKLY;
  }

  isCustom(): boolean {
    return this._type === SCHEDULE_TYPE.CUSTOM;
  }

  isScheduledForDay(dayOfWeek: number): boolean {
    if (this._type === SCHEDULE_TYPE.DAILY) {
      return true;
    }
    if (this._type === SCHEDULE_TYPE.WEEKLY) {
      return this._weeklyFlexible || this._weeklyDay === dayOfWeek;
    }
    if (this._type === SCHEDULE_TYPE.CUSTOM && this._daysOfWeek) {
      return this._daysOfWeek.includes(dayOfWeek);
    }
    return false;
  }

  equals(other: HabitSchedule): boolean {
    if (this._type !== other._type) return false;
    if (this._weeklyFlexible !== other._weeklyFlexible) return false;
    if (this._weeklyDay !== other._weeklyDay) return false;

    if (this._daysOfWeek && other._daysOfWeek) {
      if (this._daysOfWeek.length !== other._daysOfWeek.length) return false;
      return this._daysOfWeek.every(
        (day, index) => day === other._daysOfWeek![index]
      );
    }

    return this._daysOfWeek === other._daysOfWeek;
  }

  toObject(): HabitScheduleOutput {
    return {
      type: this._type,
      daysOfWeek: this._daysOfWeek ? [...this._daysOfWeek] : undefined,
      weeklyDay: this._weeklyDay,
      weeklyFlexible: this._weeklyFlexible,
    };
  }
}
