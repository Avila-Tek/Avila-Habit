import {
  BillingProvider,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionOutput,
} from '../ports/BillingProvider';

interface CreateCheckoutSessionUseCaseInput {
  billingIdentityId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export class CreateCheckoutSessionUseCase {
  private billingProvider: BillingProvider;

  constructor(billingProvider: BillingProvider) {
    this.billingProvider = billingProvider;
  }

  async execute(
    input: CreateCheckoutSessionUseCaseInput
  ): Promise<CreateCheckoutSessionOutput> {
    const checkoutInput: CreateCheckoutSessionInput = {
      billingIdentityId: input.billingIdentityId,
      priceId: input.priceId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: input.metadata,
    };

    return this.billingProvider.createCheckoutSession(checkoutInput);
  }
}
