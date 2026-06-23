import { TIME_OF_DAY, type TTimeOfDay, timeOfDayValues } from '@repo/schemas';

export class TimeOfDay {
  private constructor(private readonly _value: TTimeOfDay) {}

  static create(value: TTimeOfDay): TimeOfDay {
    if (!timeOfDayValues.includes(value)) {
      throw new Error(
        `Invalid time of day: ${value}. Must be one of: ${timeOfDayValues.join(', ')}`
      );
    }
    return new TimeOfDay(value);
  }

  static morning(): TimeOfDay {
    return new TimeOfDay(TIME_OF_DAY.MORNING);
  }

  static afternoon(): TimeOfDay {
    return new TimeOfDay(TIME_OF_DAY.AFTERNOON);
  }

  static evening(): TimeOfDay {
    return new TimeOfDay(TIME_OF_DAY.EVENING);
  }

  get value(): TTimeOfDay {
    return this._value;
  }

  equals(other: TimeOfDay): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
