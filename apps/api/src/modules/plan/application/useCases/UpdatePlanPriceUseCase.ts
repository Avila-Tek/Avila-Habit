import {
  PlanPriceRepository,
  UpdatePlanPriceInput,
} from '../ports/PlanPriceRepository';

interface UpdatePlanPriceUseCaseInput {
  id: string;
  currency?: string;
  interval?: string;
  amountCents?: number;
  trialDays?: number;
  isActive?: boolean;
}

export class UpdatePlanPriceUseCase {
  private planPriceRepository: PlanPriceRepository;

  constructor(planPriceRepository: PlanPriceRepository) {
    this.planPriceRepository = planPriceRepository;
  }

  async execute(input: UpdatePlanPriceUseCaseInput) {
    const existingPrice = await this.planPriceRepository.findById(input.id);
    if (!existingPrice) {
      throw new Error(`PlanPrice with id "${input.id}" not found`);
    }

    const updateInput: UpdatePlanPriceInput = {
      currency: input.currency,
      interval: input.interval,
      amountCents: input.amountCents,
      trialDays: input.trialDays,
      isActive: input.isActive,
    };

    return this.planPriceRepository.update(input.id, updateInput);
  }
}
