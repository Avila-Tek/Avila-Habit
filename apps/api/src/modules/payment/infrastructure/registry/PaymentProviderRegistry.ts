import { PaymentProvider } from '../../application/ports/PaymentProvider';

type ProviderNameLiteral = 'stripe';

export class PaymentProviderRegistry {
  private providers: Map<ProviderNameLiteral, PaymentProvider>;

  constructor() {
    this.providers = new Map();
  }

  register(name: ProviderNameLiteral, provider: PaymentProvider): void {
    this.providers.set(name, provider);
  }

  get(name: string): PaymentProvider {
    const provider = this.providers.get(name as ProviderNameLiteral);

    if (!provider) {
      throw new Error(`Payment provider not found: ${name}`);
    }

    return provider;
  }

  has(name: string): boolean {
    return this.providers.has(name as ProviderNameLiteral);
  }
}
