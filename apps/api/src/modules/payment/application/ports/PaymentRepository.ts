import type {
  CreatePaymentInput,
  PaymentEntity,
  PaymentStatus,
} from '../../domain/entities/PaymentEntity';

export interface UpdatePaymentInput {
  status?: PaymentStatus;
  paidAt?: Date | null;
}

export interface PaymentRepository {
  create(input: CreatePaymentInput): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByStripePaymentIntentId(
    stripePaymentIntentId: string
  ): Promise<PaymentEntity | null>;
  findByStripeInvoiceId(stripeInvoiceId: string): Promise<PaymentEntity | null>;
  findByUserId(userId: string): Promise<PaymentEntity[]>;
  findBySubscriptionId(subscriptionId: string): Promise<PaymentEntity[]>;
  update(id: string, input: UpdatePaymentInput): Promise<PaymentEntity>;
}
