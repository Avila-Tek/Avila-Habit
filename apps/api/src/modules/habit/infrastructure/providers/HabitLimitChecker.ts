import type { GetUserSubscriptionUseCase } from '@/modules/payment/application/use-case/getUserSubscription.useCase';
import type {
  CheckHabitLimitResult,
  IHabitLimitChecker,
} from '../../application/ports/habitLimitChecker.port';
import type { IHabitRepository } from '../../application/ports/habitRepository.port';

export class HabitLimitChecker implements IHabitLimitChecker {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly getUserSubscriptionUseCase: GetUserSubscriptionUseCase
  ) {}

  async checkLimit(userId: string): Promise<CheckHabitLimitResult> {
    // Get user's subscription to find the limit
    const subscription = await this.getUserSubscriptionUseCase.execute({
      userId,
    });

    // If no subscription, assume free plan with default limit (3)
    const habitsMax = subscription?.plan.limits.habitsMax ?? 3;

    // Count active habits (not deleted)
    const currentHabits = await this.habitRepository.count(userId, false);

    // If habitsMax is null, it means unlimited
    if (habitsMax === null) {
      return {
        allowed: true,
        current: currentHabits,
        limit: null,
      };
    }

    return {
      allowed: currentHabits < habitsMax,
      current: currentHabits,
      limit: habitsMax,
    };
  }
}
