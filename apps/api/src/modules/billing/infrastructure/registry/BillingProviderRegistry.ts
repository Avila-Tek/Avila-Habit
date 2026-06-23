import { BillingProvider } from '../../application/ports/BillingProvider';

type ProviderNameLiteral = 'stripe';

export class BillingProviderRegistry {
  private providers: Map<ProviderNameLiteral, BillingProvider>;

  constructor() {
    this.providers = new Map();
  }

  register(name: ProviderNameLiteral, provider: BillingProvider): void {
    this.providers.set(name, provider);
  }

  get(name: string): BillingProvider {
    const provider = this.providers.get(name as ProviderNameLiteral);

    if (!provider) {
      throw new Error(`Billing provider not found: ${name}`);
    }

    return provider;
  }

  has(name: string): boolean {
    return this.providers.has(name as ProviderNameLiteral);
  }
}
