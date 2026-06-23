import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database';
import type {
  PaymentRepository,
  UpdatePaymentInput,
} from '../../application/ports/PaymentRepository';
import type {
  CreatePaymentInput,
  PaymentEntity,
} from '../../domain/entities/PaymentEntity';
import { PaymentEntity as PaymentEntityClass } from '../../domain/entities/PaymentEntity';

type DbClient = NodePgDatabase<typeof schema>;

export class PaymentPostgresRepository implements PaymentRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreatePaymentInput): Promise<PaymentEntity> {
    const [row] = await this.db
      .insert(schema.payments)
      .values({
        userId: input.userId,
        subscriptionId: input.subscriptionId ?? null,
        amountCents: input.amountCents,
        currency: input.currency ?? 'usd',
        status: input.status ?? 'pending',
        stripePaymentIntentId: input.stripePaymentIntentId ?? null,
        stripeInvoiceId: input.stripeInvoiceId ?? null,
        stripeCustomerId: input.stripeCustomerId ?? null,
        paidAt: input.paidAt ?? null,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create payment');
    }

    return this.mapToEntity(row);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const [row] = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, id))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findByStripePaymentIntentId(
    stripePaymentIntentId: string
  ): Promise<PaymentEntity | null> {
    const [row] = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.stripePaymentIntentId, stripePaymentIntentId))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findByStripeInvoiceId(
    stripeInvoiceId: string
  ): Promise<PaymentEntity | null> {
    const [row] = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.stripeInvoiceId, stripeInvoiceId))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<PaymentEntity[]> {
    const rows = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.userId, userId));

    return rows.map((row) => this.mapToEntity(row));
  }

  async findBySubscriptionId(subscriptionId: string): Promise<PaymentEntity[]> {
    const rows = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.subscriptionId, subscriptionId));

    return rows.map((row) => this.mapToEntity(row));
  }

  async update(id: string, input: UpdatePaymentInput): Promise<PaymentEntity> {
    const [row] = await this.db
      .update(schema.payments)
      .set({
        ...(input.status !== undefined && { status: input.status }),
        ...(input.paidAt !== undefined && { paidAt: input.paidAt }),
      })
      .where(eq(schema.payments.id, id))
      .returning();

    if (!row) {
      throw new Error(`Payment not found: ${id}`);
    }

    return this.mapToEntity(row);
  }

  private mapToEntity(row: typeof schema.payments.$inferSelect): PaymentEntity {
    return PaymentEntityClass.fromPersistence({
      id: row.id,
      userId: row.userId,
      subscriptionId: row.subscriptionId,
      amountCents: row.amountCents,
      currency: row.currency,
      status: row.status as PaymentEntity['status'],
      stripePaymentIntentId: row.stripePaymentIntentId,
      stripeInvoiceId: row.stripeInvoiceId,
      stripeCustomerId: row.stripeCustomerId,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
