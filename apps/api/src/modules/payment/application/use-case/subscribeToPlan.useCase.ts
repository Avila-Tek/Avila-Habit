import type { PlanPriceRepository } from '@/modules/plan/application/ports/PlanPriceRepository';
import type { PlanRepository } from '@/modules/plan/application/ports/PlanRepository';
import { Logger } from '@/utils/logger';
import type { PaymentProvider } from '../ports/PaymentProvider';
import type { SubscriptionRepository } from '../ports/SubscriptionRepository';

export interface SubscribeToPlanInput {
  userId: string;
  planId: string;
  planPriceId: string;
  userEmail: string;
  userName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export type SubscribeToPlanOutput =
  | {
      type: 'free_subscription_created';
      subscriptionId: string;
    }
  | {
      type: 'checkout_redirect';
      checkoutUrl: string;
      checkoutSessionId: string;
    };

export class SubscribeToPlanUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly planPriceRepository: PlanPriceRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentProvider: PaymentProvider
  ) {}

  async execute(input: SubscribeToPlanInput): Promise<SubscribeToPlanOutput> {
    // Validate plan exists and is active
    const plan = await this.planRepository.findById(input.planId);
    if (!plan) {
      throw new Error(`Plan with id "${input.planId}" not found`);
    }
    if (!plan.isActive) {
      throw new Error(`Plan with id "${input.planId}" is not active`);
    }

    // Validate plan price exists and is active
    const planPrice = await this.planPriceRepository.findById(
      input.planPriceId
    );
    if (!planPrice) {
      throw new Error(`Plan price with id "${input.planPriceId}" not found`);
    }
    if (!planPrice.isActive) {
      throw new Error(
        `Plan price with id "${input.planPriceId}" is not active`
      );
    }
    if (planPrice.planId !== input.planId) {
      throw new Error('Plan price does not belong to the specified plan');
    }

    // Check for existing active subscription
    const existingSubscription =
      await this.subscriptionRepository.findActiveByUserId(input.userId);

    // Handle FREE plan subscription
    if (plan.isFree) {
      // Cancel existing subscription if any
      if (existingSubscription) {
        await this.subscriptionRepository.update(existingSubscription.id, {
          status: 'canceled',
          canceledAt: new Date(),
        });
      }

      // Create free subscription directly
      const subscription = await this.subscriptionRepository.create({
        userId: input.userId,
        planId: input.planId,
        planPriceId: input.planPriceId,
        status: 'active',
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // Free plans have no end date
        cancelAtPeriodEnd: false,
      });

      Logger.info(
        {
          requestMethod: 'create_free_subscription',
          requestStatus: 201,
          requestError: 'none',
          entityType: 'subscription',
          entityId: subscription.id,
        },
        `Free subscription created for user ${input.userId} on plan ${plan.key}`
      );

      return {
        type: 'free_subscription_created',
        subscriptionId: subscription.id,
      };
    }

    // Handle PAID plan subscription
    if (!input.successUrl || !input.cancelUrl) {
      throw new Error('successUrl and cancelUrl are required for paid plans');
    }

    if (!planPrice.stripePriceId) {
      throw new Error('Plan price is not synced with Stripe');
    }

    // Ensure billing identity exists for user
    const billingIdentity = await this.paymentProvider.ensureBillingIdentity({
      email: input.userEmail,
      name: input.userName,
      metadata: { userId: input.userId },
    });

    // Create Stripe checkout session
    const checkoutSession = await this.paymentProvider.createCheckoutSession({
      billingIdentityId: billingIdentity.billingIdentityId,
      priceId: planPrice.stripePriceId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: {
        userId: input.userId,
        planId: input.planId,
        planPriceId: input.planPriceId,
      },
    });

    Logger.info(
      {
        requestMethod: 'create_checkout_session',
        requestStatus: 201,
        requestError: 'none',
        entityType: 'checkout_session',
        entityId: checkoutSession.providerCheckoutSessionId,
      },
      `Checkout session created for user ${input.userId} on plan ${plan.key}`
    );

    return {
      type: 'checkout_redirect',
      checkoutUrl: checkoutSession.checkoutUrl,
      checkoutSessionId: checkoutSession.providerCheckoutSessionId,
    };
  }
}
