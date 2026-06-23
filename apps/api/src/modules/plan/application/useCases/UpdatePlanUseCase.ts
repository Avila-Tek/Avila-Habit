import { PlanRepository, UpdatePlanInput } from '../ports/PlanRepository';

interface UpdatePlanUseCaseInput {
  id: string;
  key?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  limitsHabitsMax?: number | null;
  limitsReportsEnabled?: boolean;
  limitsHistoryDays?: number | null;
  limitsRemindersEnabled?: boolean;
}

export class UpdatePlanUseCase {
  private planRepository: PlanRepository;

  constructor(planRepository: PlanRepository) {
    this.planRepository = planRepository;
  }

  async execute(input: UpdatePlanUseCaseInput) {
    if (input.key !== undefined) {
      throw new Error('Plan key cannot be updated');
    }

    const existingPlan = await this.planRepository.findById(input.id);
    if (!existingPlan) {
      throw new Error(`Plan with id "${input.id}" not found`);
    }

    const updateInput: UpdatePlanInput = {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
      limitsHabitsMax: input.limitsHabitsMax,
      limitsReportsEnabled: input.limitsReportsEnabled,
      limitsHistoryDays: input.limitsHistoryDays,
      limitsRemindersEnabled: input.limitsRemindersEnabled,
    };

    return this.planRepository.update(input.id, updateInput);
  }
}
