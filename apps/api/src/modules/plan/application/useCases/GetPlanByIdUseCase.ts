import { PlanError } from '../../domain/errors/plan.errors';
import type { PlanRepository, PlanWithPrices } from '../ports/PlanRepository';

export interface GetPlanByIdInput {
  id: string;
}

export class GetPlanByIdUseCase {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(input: GetPlanByIdInput): Promise<PlanWithPrices> {
    const planWithPrices = await this.planRepository.findByIdWithPrices(
      input.id
    );

    if (!planWithPrices) {
      throw PlanError.notFound(input.id);
    }

    return planWithPrices;
  }
}
