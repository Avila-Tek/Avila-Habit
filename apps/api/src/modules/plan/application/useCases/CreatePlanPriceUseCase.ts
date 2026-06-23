import { PaymentProvider } from '../../../payment/application/ports/PaymentProvider';
import {
  CreatePlanPriceInput,
  PlanPriceRepository,
} from '../ports/PlanPriceRepository';
import { PlanRepository } from '../ports/PlanRepository';

interface CreatePlanPriceUseCaseInput {
  planId: string;
  currency?: string;
  interval: string;
  amountCents: number;
  trialDays?: number;
  isActive?: boolean;
}

export class CreatePlanPriceUseCase {
  private planRepository: PlanRepository;
  private planPriceRepository: PlanPriceRepository;
  private paymentProvider: PaymentProvider;

  constructor(
    planRepository: PlanRepository,
    planPriceRepository: PlanPriceRepository,
    paymentProvider: PaymentProvider
  ) {
    this.planRepository = planRepository;
    this.planPriceRepository = planPriceRepository;
    this.paymentProvider = paymentProvider;
  }

  async execute(input: CreatePlanPriceUseCaseInput) {
    const plan = await this.planRepository.findById(input.planId);
    if (!plan) {
      throw new Error(`Plan with id "${input.planId}" not found`);
    }

    // Free plans do not need Stripe price synchronization
    if (plan.isFree) {
      if (input.amountCents !== 0) {
        throw new Error('Free plan prices must have amountCents=0');
      }

      const createInput: CreatePlanPriceInput = {
        planId: input.planId,
        currency: input.currency,
        interval: input.interval,
        amountCents: 0,
        trialDays: 0,
        isActive: input.isActive,
        stripePriceId: null,
      };

      return this.planPriceRepository.create(createInput);
    }

    // Paid plans require Stripe product synchronization
    if (!plan.stripeProductId) {
      throw new Error(
        `Plan with id "${input.planId}" is not synced with Stripe`
      );
    }

    const stripePrice = await this.paymentProvider.createPrice({
      productId: plan.stripeProductId,
      currency: input.currency ?? 'usd',
      interval: input.interval,
      amountCents: input.amountCents,
      trialDays: input.trialDays,
      metadata: { planId: input.planId },
    });

    const createInput: CreatePlanPriceInput = {
      planId: input.planId,
      currency: input.currency,
      interval: input.interval,
      amountCents: input.amountCents,
      trialDays: input.trialDays,
      isActive: input.isActive,
      stripePriceId: stripePrice.priceId,
    };

    return this.planPriceRepository.create(createInput);
  }
}
