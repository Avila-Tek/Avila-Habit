import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database';
import {
  CreatePlanInput,
  PlanRepository,
  PlanWithPrices,
  UpdatePlanInput,
} from '../../application/ports/PlanRepository';
import { PlanEntity } from '../../domain/entities/PlanEntity';
import { PlanPriceEntity } from '../../domain/entities/PlanPriceEntity';

export class PlanPostgresRepository implements PlanRepository {
  private db: NodePgDatabase<typeof schema>;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.db = db;
  }

  async findById(id: string): Promise<PlanEntity | null> {
    const result = await this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  async findByIdWithPrices(id: string): Promise<PlanWithPrices | null> {
    const planResult = await this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.id, id))
      .limit(1);

    if (planResult.length === 0) {
      return null;
    }

    const pricesResult = await this.db
      .select()
      .from(schema.planPrices)
      .where(
        and(
          eq(schema.planPrices.planId, id),
          eq(schema.planPrices.isActive, true)
        )
      );

    const planWithPrices = this.mapToEntity(planResult[0]!) as PlanWithPrices;
    planWithPrices.prices = pricesResult.map((price) =>
      this.mapPriceToEntity(price)
    );

    return planWithPrices;
  }

  async findByKey(key: string): Promise<PlanEntity | null> {
    const result = await this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.key, key))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  async findAllActive(): Promise<PlanEntity[]> {
    const result = await this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.isActive, true));

    return result.map((row) => this.mapToEntity(row));
  }

  async findAllActiveWithActivePrices(): Promise<PlanWithPrices[]> {
    const plansResult = await this.db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.isActive, true));

    const plansWithPrices: PlanWithPrices[] = [];

    for (const plan of plansResult) {
      const pricesResult = await this.db
        .select()
        .from(schema.planPrices)
        .where(
          and(
            eq(schema.planPrices.planId, plan.id),
            eq(schema.planPrices.isActive, true)
          )
        );

      const planEntity = this.mapToEntity(plan) as PlanWithPrices;
      planEntity.prices = pricesResult.map((price) =>
        this.mapPriceToEntity(price)
      );
      plansWithPrices.push(planEntity);
    }

    return plansWithPrices;
  }

  async findAll(): Promise<PlanEntity[]> {
    const result = await this.db.select().from(schema.plans);

    return result.map((row) => this.mapToEntity(row));
  }

  async create(input: CreatePlanInput): Promise<PlanEntity> {
    const result = await this.db
      .insert(schema.plans)
      .values({
        key: input.key,
        name: input.name,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
        isFree: input.isFree ?? false,
        displayOrder: input.displayOrder ?? 0,
        limitsHabitsMax: input.limitsHabitsMax ?? null,
        limitsReportsEnabled: input.limitsReportsEnabled ?? true,
        limitsHistoryDays: input.limitsHistoryDays ?? null,
        limitsRemindersEnabled: input.limitsRemindersEnabled ?? true,
        stripeProductId: input.stripeProductId ?? null,
      })
      .returning();

    return this.mapToEntity(result[0]!);
  }

  async update(id: string, input: UpdatePlanInput): Promise<PlanEntity | null> {
    const result = await this.db
      .update(schema.plans)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isFree !== undefined && { isFree: input.isFree }),
        ...(input.displayOrder !== undefined && {
          displayOrder: input.displayOrder,
        }),
        ...(input.limitsHabitsMax !== undefined && {
          limitsHabitsMax: input.limitsHabitsMax,
        }),
        ...(input.limitsReportsEnabled !== undefined && {
          limitsReportsEnabled: input.limitsReportsEnabled,
        }),
        ...(input.limitsHistoryDays !== undefined && {
          limitsHistoryDays: input.limitsHistoryDays,
        }),
        ...(input.limitsRemindersEnabled !== undefined && {
          limitsRemindersEnabled: input.limitsRemindersEnabled,
        }),
        ...(input.stripeProductId !== undefined && {
          stripeProductId: input.stripeProductId,
        }),
      })
      .where(eq(schema.plans.id, id))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  async softDelete(id: string): Promise<PlanEntity | null> {
    const result = await this.db
      .update(schema.plans)
      .set({ isActive: false })
      .where(eq(schema.plans.id, id))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  private mapToEntity(row: typeof schema.plans.$inferSelect): PlanEntity {
    return PlanEntity.create({
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      isFree: row.isFree,
      displayOrder: row.displayOrder,
      limitsHabitsMax: row.limitsHabitsMax,
      limitsReportsEnabled: row.limitsReportsEnabled,
      limitsHistoryDays: row.limitsHistoryDays,
      limitsRemindersEnabled: row.limitsRemindersEnabled,
      stripeProductId: row.stripeProductId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private mapPriceToEntity(
    row: typeof schema.planPrices.$inferSelect
  ): PlanPriceEntity {
    return PlanPriceEntity.create({
      id: row.id,
      planId: row.planId,
      currency: row.currency,
      interval: row.interval,
      amountCents: row.amountCents,
      trialDays: row.trialDays,
      isActive: row.isActive,
      stripePriceId: row.stripePriceId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
