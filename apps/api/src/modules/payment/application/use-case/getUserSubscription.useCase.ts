import type { PlanPriceRepository } from '@/modules/plan/application/ports/PlanPriceRepository';
import type { PlanRepository } from '@/modules/plan/application/ports/PlanRepository';
import type { SubscriptionRepository } from '../ports/SubscriptionRepository';

export interface GetUserSubscriptionInput {
  userId: string;
}

export interface UserSubscriptionOutput {
  id: string;
  userId: string;
  status: string;
  isFree: boolean;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  plan: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    isFree: boolean;
    limits: {
      habitsMax: number | null;
      reportsEnabled: boolean;
      historyDays: number | null;
      remindersEnabled: boolean;
    };
  };
  price: {
    id: string;
    currency: string;
    interval: string;
    amountCents: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class GetUserSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planRepository: PlanRepository,
    private readonly planPriceRepository: PlanPriceRepository
  ) {}

  async execute(
    input: GetUserSubscriptionInput
  ): Promise<UserSubscriptionOutput | null> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(
      input.userId
    );

    if (!subscription) {
      return null;
    }

    const plan = await this.planRepository.findById(subscription.planId);
    if (!plan) {
      throw new Error(`Plan with id "${subscription.planId}" not found`);
    }

    const planPrice = await this.planPriceRepository.findById(
      subscription.planPriceId
    );
    if (!planPrice) {
      throw new Error(
        `Plan price with id "${subscription.planPriceId}" not found`
      );
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      status: subscription.status,
      isFree: plan.isFree,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt,
      plan: {
        id: plan.id,
        key: plan.key,
        name: plan.name,
        description: plan.description,
        isFree: plan.isFree,
        limits: {
          habitsMax: plan.limitsHabitsMax,
          reportsEnabled: plan.limitsReportsEnabled,
          historyDays: plan.limitsHistoryDays,
          remindersEnabled: plan.limitsRemindersEnabled,
        },
      },
      price: {
        id: planPrice.id,
        currency: planPrice.currency,
        interval: planPrice.interval,
        amountCents: planPrice.amountCents,
      },
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
