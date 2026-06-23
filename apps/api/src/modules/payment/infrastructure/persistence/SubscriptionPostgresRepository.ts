import { and, desc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database';
import type {
  SubscriptionRepository,
  UpdateSubscriptionInput,
} from '../../application/ports/SubscriptionRepository';
import type {
  CreateSubscriptionInput,
  SubscriptionEntity,
} from '../../domain/entities/SubscriptionEntity';
import { SubscriptionEntity as SubscriptionEntityClass } from '../../domain/entities/SubscriptionEntity';

type DbClient = NodePgDatabase<typeof schema>;

export class SubscriptionPostgresRepository implements SubscriptionRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    const [row] = await this.db
      .insert(schema.subscriptions)
      .values({
        userId: input.userId,
        planId: input.planId,
        planPriceId: input.planPriceId,
        status: input.status ?? 'active',
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        stripeCustomerId: input.stripeCustomerId ?? null,
        currentPeriodStart: input.currentPeriodStart ?? null,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create subscription');
    }

    return this.mapToEntity(row);
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const [row] = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, id))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionEntity | null> {
    const [row] = await this.db
      .select()
      .from(schema.subscriptions)
      .where(
        eq(schema.subscriptions.stripeSubscriptionId, stripeSubscriptionId)
      )
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity[]> {
    const rows = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, userId));

    return rows.map((row) => this.mapToEntity(row));
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const [row] = await this.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, userId),
          eq(schema.subscriptions.status, 'active')
        )
      )
      .orderBy(desc(schema.subscriptions.createdAt))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async update(
    id: string,
    input: UpdateSubscriptionInput
  ): Promise<SubscriptionEntity> {
    const [row] = await this.db
      .update(schema.subscriptions)
      .set({
        ...(input.status !== undefined && { status: input.status }),
        ...(input.currentPeriodStart !== undefined && {
          currentPeriodStart: input.currentPeriodStart,
        }),
        ...(input.currentPeriodEnd !== undefined && {
          currentPeriodEnd: input.currentPeriodEnd,
        }),
        ...(input.cancelAtPeriodEnd !== undefined && {
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        }),
        ...(input.canceledAt !== undefined && { canceledAt: input.canceledAt }),
      })
      .where(eq(schema.subscriptions.id, id))
      .returning();

    if (!row) {
      throw new Error(`Subscription not found: ${id}`);
    }

    return this.mapToEntity(row);
  }

  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    input: UpdateSubscriptionInput
  ): Promise<SubscriptionEntity | null> {
    const [row] = await this.db
      .update(schema.subscriptions)
      .set({
        ...(input.status !== undefined && { status: input.status }),
        ...(input.currentPeriodStart !== undefined && {
          currentPeriodStart: input.currentPeriodStart,
        }),
        ...(input.currentPeriodEnd !== undefined && {
          currentPeriodEnd: input.currentPeriodEnd,
        }),
        ...(input.cancelAtPeriodEnd !== undefined && {
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        }),
        ...(input.canceledAt !== undefined && { canceledAt: input.canceledAt }),
      })
      .where(
        eq(schema.subscriptions.stripeSubscriptionId, stripeSubscriptionId)
      )
      .returning();

    return row ? this.mapToEntity(row) : null;
  }

  private mapToEntity(
    row: typeof schema.subscriptions.$inferSelect
  ): SubscriptionEntity {
    return SubscriptionEntityClass.fromPersistence({
      id: row.id,
      userId: row.userId,
      planId: row.planId,
      planPriceId: row.planPriceId,
      status: row.status as SubscriptionEntity['status'],
      stripeSubscriptionId: row.stripeSubscriptionId,
      stripeCustomerId: row.stripeCustomerId,
      currentPeriodStart: row.currentPeriodStart,
      currentPeriodEnd: row.currentPeriodEnd,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      canceledAt: row.canceledAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
