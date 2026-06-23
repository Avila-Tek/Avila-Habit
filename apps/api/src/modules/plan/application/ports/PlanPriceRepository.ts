import { PlanPriceEntity } from '../../domain/entities/PlanPriceEntity';

export interface CreatePlanPriceInput {
  planId: string;
  currency?: string;
  interval: string;
  amountCents: number;
  trialDays?: number;
  isActive?: boolean;
  stripePriceId?: string | null;
}

export interface UpdatePlanPriceInput {
  currency?: string;
  interval?: string;
  amountCents?: number;
  trialDays?: number;
  isActive?: boolean;
  stripePriceId?: string | null;
}

export interface PlanPriceRepository {
  findById(id: string): Promise<PlanPriceEntity | null>;
  findByPlanId(planId: string): Promise<PlanPriceEntity[]>;
  findActiveByPlanId(planId: string): Promise<PlanPriceEntity[]>;
  create(input: CreatePlanPriceInput): Promise<PlanPriceEntity>;
  update(
    id: string,
    input: UpdatePlanPriceInput
  ): Promise<PlanPriceEntity | null>;
  softDelete(id: string): Promise<PlanPriceEntity | null>;
}
