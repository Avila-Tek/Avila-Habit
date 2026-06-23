import type {
  CreateSubscriptionInput,
  SubscriptionEntity,
  SubscriptionStatus,
} from '../../domain/entities/SubscriptionEntity';

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}

export interface SubscriptionRepository {
  create(input: CreateSubscriptionInput): Promise<SubscriptionEntity>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionEntity | null>;
  findByUserId(userId: string): Promise<SubscriptionEntity[]>;
  findActiveByUserId(userId: string): Promise<SubscriptionEntity | null>;
  update(
    id: string,
    input: UpdateSubscriptionInput
  ): Promise<SubscriptionEntity>;
  updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    input: UpdateSubscriptionInput
  ): Promise<SubscriptionEntity | null>;
}
