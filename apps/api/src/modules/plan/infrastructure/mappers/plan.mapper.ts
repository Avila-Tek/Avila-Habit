import type { TPlanCatalogItem, TPlanPrice } from '@repo/schemas';
import type { PlanWithPrices } from '../../application/ports/PlanRepository';
import type { PlanPriceEntity } from '../../domain/entities/PlanPriceEntity';

/**
 * Maps domain entities to DTOs for API responses
 */
export class PlanMapper {
  static toPriceResponse(price: PlanPriceEntity): TPlanPrice {
    return {
      id: price.id,
      currency: price.currency,
      interval: price.interval,
      amountCents: price.amountCents,
      trialDays: price.trialDays,
      isActive: price.isActive,
    };
  }

  static toCatalogItem(plan: PlanWithPrices): TPlanCatalogItem {
    return {
      id: plan.id,
      key: plan.key,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      isFree: plan.isFree,
      displayOrder: plan.displayOrder,
      limits: {
        habitsMax: plan.limitsHabitsMax,
        reportsEnabled: plan.limitsReportsEnabled,
        historyDays: plan.limitsHistoryDays,
        remindersEnabled: plan.limitsRemindersEnabled,
      },
      prices: plan.prices.map((price) => this.toPriceResponse(price)),
    };
  }

  static toCatalogItemList(plans: PlanWithPrices[]): TPlanCatalogItem[] {
    return plans.map((plan) => this.toCatalogItem(plan));
  }
}
