export class PermissionCode {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Permission code cannot be empty');
    }

    // Format: resource:action or resource:action:scope
    const validFormat = /^[a-z]+:[a-z]+(:[a-z]+)?$/;
    if (!validFormat.test(value)) {
      throw new Error(
        `Invalid permission code format: ${value}. Expected: resource:action or resource:action:scope`
      );
    }

    this._value = value.toLowerCase();
  }

  static create(value: string): PermissionCode {
    return new PermissionCode(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PermissionCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
