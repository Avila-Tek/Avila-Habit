export class HabitId {
  private constructor(private readonly _value: string) {}

  static create(value: string): HabitId {
    if (!value || typeof value !== 'string') {
      throw new Error('HabitId must be a non-empty string');
    }
    return new HabitId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: HabitId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
