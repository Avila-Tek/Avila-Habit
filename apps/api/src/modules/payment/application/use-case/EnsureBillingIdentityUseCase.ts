import {
  EnsureBillingIdentityInput,
  EnsureBillingIdentityOutput,
  PaymentProvider,
} from '../ports/PaymentProvider';

export class EnsureBillingIdentityUseCase {
  private paymentProvider: PaymentProvider;

  constructor(paymentProvider: PaymentProvider) {
    this.paymentProvider = paymentProvider;
  }

  execute(
    input: EnsureBillingIdentityInput
  ): Promise<EnsureBillingIdentityOutput> {
    return this.paymentProvider.ensureBillingIdentity(input);
  }
}
