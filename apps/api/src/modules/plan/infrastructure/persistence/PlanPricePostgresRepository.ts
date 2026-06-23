import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database';
import {
  CreatePlanPriceInput,
  PlanPriceRepository,
  UpdatePlanPriceInput,
} from '../../application/ports/PlanPriceRepository';
import { PlanPriceEntity } from '../../domain/entities/PlanPriceEntity';

export class PlanPricePostgresRepository implements PlanPriceRepository {
  private db: NodePgDatabase<typeof schema>;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.db = db;
  }

  async findById(id: string): Promise<PlanPriceEntity | null> {
    const result = await this.db
      .select()
      .from(schema.planPrices)
      .where(eq(schema.planPrices.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  async findByPlanId(planId: string): Promise<PlanPriceEntity[]> {
    const result = await this.db
      .select()
      .from(schema.planPrices)
      .where(eq(schema.planPrices.planId, planId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findActiveByPlanId(planId: string): Promise<PlanPriceEntity[]> {
    const result = await this.db
      .select()
      .from(schema.planPrices)
      .where(
        and(
          eq(schema.planPrices.planId, planId),
          eq(schema.planPrices.isActive, true)
        )
      );

    return result.map((row) => this.mapToEntity(row));
  }

  async create(input: CreatePlanPriceInput): Promise<PlanPriceEntity> {
    const result = await this.db
      .insert(schema.planPrices)
      .values({
        planId: input.planId,
        currency: input.currency ?? 'usd',
        interval: input.interval,
        amountCents: input.amountCents,
        trialDays: input.trialDays ?? 0,
        isActive: input.isActive ?? true,
        stripePriceId: input.stripePriceId ?? null,
      })
      .returning();

    return this.mapToEntity(result[0]!);
  }

  async update(
    id: string,
    input: UpdatePlanPriceInput
  ): Promise<PlanPriceEntity | null> {
    const result = await this.db
      .update(schema.planPrices)
      .set({
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.interval !== undefined && { interval: input.interval }),
        ...(input.amountCents !== undefined && {
          amountCents: input.amountCents,
        }),
        ...(input.trialDays !== undefined && { trialDays: input.trialDays }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.stripePriceId !== undefined && {
          stripePriceId: input.stripePriceId,
        }),
      })
      .where(eq(schema.planPrices.id, id))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  async softDelete(id: string): Promise<PlanPriceEntity | null> {
    const result = await this.db
      .update(schema.planPrices)
      .set({ isActive: false })
      .where(eq(schema.planPrices.id, id))
      .returning();

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]!);
  }

  private mapToEntity(
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
