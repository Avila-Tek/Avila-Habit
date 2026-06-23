import { PlanRepository } from '../ports/PlanRepository';

interface DeletePlanUseCaseInput {
  id: string;
}

export class DeletePlanUseCase {
  private planRepository: PlanRepository;

  constructor(planRepository: PlanRepository) {
    this.planRepository = planRepository;
  }

  async execute(input: DeletePlanUseCaseInput) {
    const existingPlan = await this.planRepository.findById(input.id);
    if (!existingPlan) {
      throw new Error(`Plan with id "${input.id}" not found`);
    }

    return this.planRepository.softDelete(input.id);
  }
}
