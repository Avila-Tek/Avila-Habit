import {
  BillingProvider,
  EnsureBillingIdentityInput,
  EnsureBillingIdentityOutput,
} from '../ports/BillingProvider';

export class EnsureBillingIdentityUseCase {
  private billingProvider: BillingProvider;

  constructor(billingProvider: BillingProvider) {
    this.billingProvider = billingProvider;
  }

  execute(
    input: EnsureBillingIdentityInput
  ): Promise<EnsureBillingIdentityOutput> {
    return this.billingProvider.ensureBillingIdentity(input);
  }
}
