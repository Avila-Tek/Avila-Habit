import { PaymentProvider } from '../../../payment/application/ports/PaymentProvider';
import { CreatePlanInput, PlanRepository } from '../ports/PlanRepository';

interface CreatePlanUseCaseInput {
  key: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  isFree?: boolean;
  displayOrder?: number;
  limitsHabitsMax?: number | null;
  limitsReportsEnabled?: boolean;
  limitsHistoryDays?: number | null;
  limitsRemindersEnabled?: boolean;
}

export class CreatePlanUseCase {
  private planRepository: PlanRepository;
  private paymentProvider: PaymentProvider;

  constructor(
    planRepository: PlanRepository,
    paymentProvider: PaymentProvider
  ) {
    this.planRepository = planRepository;
    this.paymentProvider = paymentProvider;
  }

  async execute(input: CreatePlanUseCaseInput) {
    const existingPlan = await this.planRepository.findByKey(input.key);
    if (existingPlan) {
      throw new Error(`Plan with key "${input.key}" already exists`);
    }

    // Free plans do not need a Stripe product
    let stripeProductId: string | null = null;

    if (!input.isFree) {
      const stripeProduct = await this.paymentProvider.createProduct({
        name: input.name,
        description: input.description,
        metadata: { planKey: input.key },
      });
      stripeProductId = stripeProduct.productId;
    }

    const createInput: CreatePlanInput = {
      key: input.key,
      name: input.name,
      description: input.description,
      isActive: input.isActive,
      isFree: input.isFree ?? false,
      displayOrder: input.displayOrder ?? 0,
      limitsHabitsMax: input.limitsHabitsMax,
      limitsReportsEnabled: input.limitsReportsEnabled,
      limitsHistoryDays: input.limitsHistoryDays,
      limitsRemindersEnabled: input.limitsRemindersEnabled,
      stripeProductId,
    };

    return this.planRepository.create(createInput);
  }
}
