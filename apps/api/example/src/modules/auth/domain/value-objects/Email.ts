export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Email {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email format');
    }
    return new Email(value);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
