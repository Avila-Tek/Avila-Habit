export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'canceled';

export interface PaymentProps {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeInvoiceId: string | null;
  stripeCustomerId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  userId: string;
  subscriptionId?: string | null;
  amountCents: number;
  currency?: string;
  status?: PaymentStatus;
  stripePaymentIntentId?: string | null;
  stripeInvoiceId?: string | null;
  stripeCustomerId?: string | null;
  paidAt?: Date | null;
}

export class PaymentEntity {
  readonly id: string;
  readonly userId: string;
  readonly subscriptionId: string | null;
  readonly amountCents: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly stripePaymentIntentId: string | null;
  readonly stripeInvoiceId: string | null;
  readonly stripeCustomerId: string | null;
  readonly paidAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: PaymentProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.subscriptionId = props.subscriptionId;
    this.amountCents = props.amountCents;
    this.currency = props.currency;
    this.status = props.status;
    this.stripePaymentIntentId = props.stripePaymentIntentId;
    this.stripeInvoiceId = props.stripeInvoiceId;
    this.stripeCustomerId = props.stripeCustomerId;
    this.paidAt = props.paidAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPersistence(props: PaymentProps): PaymentEntity {
    return new PaymentEntity(props);
  }

  isSuccessful(): boolean {
    return this.status === 'succeeded';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }
}
