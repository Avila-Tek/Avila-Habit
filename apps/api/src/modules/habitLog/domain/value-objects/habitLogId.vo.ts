export class HabitLogId {
  private constructor(private readonly _value: string) {}

  static create(value: string): HabitLogId {
    if (!value || typeof value !== 'string') {
      throw new Error('HabitLogId must be a non-empty string');
    }
    return new HabitLogId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitLogId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
