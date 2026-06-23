import {
  HABIT_STATUS,
  habitStatusValues,
  type THabitStatus,
} from '@repo/schemas';
import { InvalidHabitDataError } from '../errors/habit.errors';

export class HabitStatus {
  private constructor(private readonly _value: THabitStatus) {}

  private static validateStatus(value: THabitStatus): void {
    if (!habitStatusValues.includes(value)) {
      throw new InvalidHabitDataError(
        `Invalid habit status: ${value}. Must be one of: ${habitStatusValues.join(', ')}`
      );
    }
  }

  static create(value: THabitStatus): HabitStatus {
    HabitStatus.validateStatus(value);
    return new HabitStatus(value);
  }

  static active(): HabitStatus {
    return new HabitStatus(HABIT_STATUS.ACTIVE);
  }

  static paused(): HabitStatus {
    return new HabitStatus(HABIT_STATUS.PAUSED);
  }

  static blocked(): HabitStatus {
    return new HabitStatus(HABIT_STATUS.BLOCKED);
  }

  get value(): THabitStatus {
    return this._value;
  }

  isActive(): boolean {
    return this._value === HABIT_STATUS.ACTIVE;
  }

  isPaused(): boolean {
    return this._value === HABIT_STATUS.PAUSED;
  }

  isBlocked(): boolean {
    return this._value === HABIT_STATUS.BLOCKED;
  }

  equals(other: HabitStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
