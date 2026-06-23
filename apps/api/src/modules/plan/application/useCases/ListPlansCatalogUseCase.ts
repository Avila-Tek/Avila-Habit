import { PlanRepository, PlanWithPrices } from '../ports/PlanRepository';

interface PlanPriceCatalogItem {
  id: string;
  currency: string;
  interval: string;
  amountCents: number;
  trialDays: number;
  isActive: boolean;
}

interface PlanCatalogItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isFree: boolean;
  displayOrder: number;
  limits: {
    habitsMax: number | null;
    reportsEnabled: boolean;
    historyDays: number | null;
    remindersEnabled: boolean;
  };
  prices: PlanPriceCatalogItem[];
}

export class ListPlansCatalogUseCase {
  private planRepository: PlanRepository;

  constructor(planRepository: PlanRepository) {
    this.planRepository = planRepository;
  }

  async execute(): Promise<PlanCatalogItem[]> {
    const plansWithPrices =
      await this.planRepository.findAllActiveWithActivePrices();

    // Sort by displayOrder ascending
    const sortedPlans = plansWithPrices.sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    return sortedPlans.map((plan) => this.mapToCatalogItem(plan));
  }

  private mapToCatalogItem(plan: PlanWithPrices): PlanCatalogItem {
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
      prices: plan.prices.map((price) => ({
        id: price.id,
        currency: price.currency,
        interval: price.interval,
        amountCents: price.amountCents,
        trialDays: price.trialDays,
        isActive: price.isActive,
      })),
    };
  }
}
