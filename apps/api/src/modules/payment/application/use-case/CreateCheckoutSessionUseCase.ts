import {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionOutput,
  PaymentProvider,
} from '../ports/PaymentProvider';

interface CreateCheckoutSessionUseCaseInput {
  billingIdentityId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export class CreateCheckoutSessionUseCase {
  private paymentProvider: PaymentProvider;

  constructor(paymentProvider: PaymentProvider) {
    this.paymentProvider = paymentProvider;
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

    return this.paymentProvider.createCheckoutSession(checkoutInput);
  }
}
