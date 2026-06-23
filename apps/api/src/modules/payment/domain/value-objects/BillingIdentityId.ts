export class BillingIdentityId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): BillingIdentityId {
    if (!this.isValid(value)) {
      throw new Error('BillingIdentityId cannot be empty');
    }
    return new BillingIdentityId(value);
  }

  private static isValid(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: BillingIdentityId): boolean {
    return this.value === other.value;
  }
}
