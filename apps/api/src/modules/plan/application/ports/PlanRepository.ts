import { PlanEntity } from '../../domain/entities/PlanEntity';
import { PlanPriceEntity } from '../../domain/entities/PlanPriceEntity';

export interface CreatePlanInput {
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
  stripeProductId?: string | null;
}

export interface UpdatePlanInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  isFree?: boolean;
  displayOrder?: number;
  limitsHabitsMax?: number | null;
  limitsReportsEnabled?: boolean;
  limitsHistoryDays?: number | null;
  limitsRemindersEnabled?: boolean;
  stripeProductId?: string | null;
}

export interface PlanWithPrices extends PlanEntity {
  prices: PlanPriceEntity[];
}

export interface PlanRepository {
  findById(id: string): Promise<PlanEntity | null>;
  findByIdWithPrices(id: string): Promise<PlanWithPrices | null>;
  findByKey(key: string): Promise<PlanEntity | null>;
  findAllActive(): Promise<PlanEntity[]>;
  findAllActiveWithActivePrices(): Promise<PlanWithPrices[]>;
  findAll(): Promise<PlanEntity[]>;
  create(input: CreatePlanInput): Promise<PlanEntity>;
  update(id: string, input: UpdatePlanInput): Promise<PlanEntity | null>;
  softDelete(id: string): Promise<PlanEntity | null>;
}
