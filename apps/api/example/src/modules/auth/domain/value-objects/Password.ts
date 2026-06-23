export class Password {
  private readonly value: string;
  private readonly hashed: boolean = false;

  private constructor(value: string, hashed: boolean = false) {
    this.value = value;
    this.hashed = hashed;
  }

  static create(value: string): Password {
    if (!this.isValidPassword(value)) {
      throw new Error('Invalid password format');
    }
    return new Password(value);
  }

  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue, true);
  }

  private static isValidPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Password | string): boolean {
    if (typeof other === 'string') {
      return this.value === other;
    }
    return this.value === other.value;
  }

  isHashed(): boolean {
    return this.hashed;
  }
}
