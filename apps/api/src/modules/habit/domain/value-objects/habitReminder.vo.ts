import { InvalidReminderError } from '../errors/habit.errors';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface HabitReminderProps {
  time?: string;
  enabled: boolean;
}

export class HabitReminder {
  private constructor(
    private readonly _time: string | undefined,
    private readonly _enabled: boolean
  ) {}

  private static validateTimeRequired(props: HabitReminderProps): void {
    if (props.enabled && !props.time) {
      throw new InvalidReminderError(
        'Reminder time is required when reminder is enabled'
      );
    }
  }

  private static validateTimeFormat(time: string | undefined): void {
    if (time && !TIME_REGEX.test(time)) {
      throw new InvalidReminderError(
        'Invalid reminder time format. Must be HH:mm (24-hour format)'
      );
    }
  }

  private static validateProps(props: HabitReminderProps): void {
    HabitReminder.validateTimeRequired(props);
    HabitReminder.validateTimeFormat(props.time);
  }

  static create(props: HabitReminderProps): HabitReminder {
    HabitReminder.validateProps(props);

    return new HabitReminder(props.time, props.enabled);
  }

  static disabled(): HabitReminder {
    return new HabitReminder(undefined, false);
  }

  static enabled(time: string): HabitReminder {
    return HabitReminder.create({ time, enabled: true });
  }

  get time(): string | undefined {
    return this._time;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  equals(other: HabitReminder): boolean {
    return this._time === other._time && this._enabled === other._enabled;
  }

  toObject(): HabitReminderProps {
    return {
      time: this._time,
      enabled: this._enabled,
    };
  }
}
