import { PlanPriceRepository } from '../ports/PlanPriceRepository';

interface DeletePlanPriceUseCaseInput {
  id: string;
}

export class DeletePlanPriceUseCase {
  private planPriceRepository: PlanPriceRepository;

  constructor(planPriceRepository: PlanPriceRepository) {
    this.planPriceRepository = planPriceRepository;
  }

  async execute(input: DeletePlanPriceUseCaseInput) {
    const existingPrice = await this.planPriceRepository.findById(input.id);
    if (!existingPrice) {
      throw new Error(`PlanPrice with id "${input.id}" not found`);
    }

    return this.planPriceRepository.softDelete(input.id);
  }
}
