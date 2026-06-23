export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionProps {
  id: string;
  userId: string;
  planId: string;
  planPriceId: string;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  planPriceId: string;
  status?: SubscriptionStatus;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionEntity {
  readonly id: string;
  readonly userId: string;
  readonly planId: string;
  readonly planPriceId: string;
  readonly status: SubscriptionStatus;
  readonly stripeSubscriptionId: string | null;
  readonly stripeCustomerId: string | null;
  readonly currentPeriodStart: Date | null;
  readonly currentPeriodEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
  readonly canceledAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: SubscriptionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.planId = props.planId;
    this.planPriceId = props.planPriceId;
    this.status = props.status;
    this.stripeSubscriptionId = props.stripeSubscriptionId;
    this.stripeCustomerId = props.stripeCustomerId;
    this.currentPeriodStart = props.currentPeriodStart;
    this.currentPeriodEnd = props.currentPeriodEnd;
    this.cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this.canceledAt = props.canceledAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPersistence(props: SubscriptionProps): SubscriptionEntity {
    return new SubscriptionEntity(props);
  }

  isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  isCanceled(): boolean {
    return this.status === 'canceled';
  }
}
