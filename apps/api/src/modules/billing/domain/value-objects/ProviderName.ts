const VALID_PROVIDER_NAMES = ['stripe'] as const;

type ValidProviderName = (typeof VALID_PROVIDER_NAMES)[number];

export class ProviderName {
  private readonly value: ValidProviderName;

  private constructor(value: ValidProviderName) {
    this.value = value;
  }

  static create(value: string): ProviderName {
    if (!this.isValid(value)) {
      throw new Error(
        `Invalid provider name: ${value}. Valid values: ${VALID_PROVIDER_NAMES.join(', ')}`
      );
    }
    return new ProviderName(value as ValidProviderName);
  }

  private static isValid(value: string): value is ValidProviderName {
    return VALID_PROVIDER_NAMES.includes(value as ValidProviderName);
  }

  getValue(): ValidProviderName {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProviderName): boolean {
    return this.value === other.value;
  }
}
