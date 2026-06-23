import { Logger } from '@/utils/logger';
import type { SubscriptionStatus } from '../../domain/entities/SubscriptionEntity';
import type { WebhookParsedEvent } from '../ports/PaymentProvider';
import type { PaymentRepository } from '../ports/PaymentRepository';
import type { SubscriptionRepository } from '../ports/SubscriptionRepository';

interface HandleWebhookEventInput {
  parsedEvent: WebhookParsedEvent;
}

interface HandleWebhookEventOutput {
  handled: boolean;
  action?: string;
  entityId?: string;
}

interface StripeCheckoutSession {
  id: string;
  customer: string;
  subscription: string;
  metadata?: {
    userId?: string;
    planId?: string;
    planPriceId?: string;
  };
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  metadata?: {
    userId?: string;
    planId?: string;
    planPriceId?: string;
  };
}

interface StripeInvoice {
  id: string;
  customer: string;
  subscription: string;
  amount_paid: number;
  currency: string;
  status: string;
  payment_intent: string;
  metadata?: {
    userId?: string;
  };
}

export class HandleWebhookEventUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async execute(
    input: HandleWebhookEventInput
  ): Promise<HandleWebhookEventOutput> {
    const { parsedEvent } = input;

    Logger.info(
      {
        requestMethod: `webhook_${parsedEvent.eventType.replace(/\./g, '_')}`,
        requestStatus: 200,
        requestError: 'none',
        entityType: 'webhook',
        entityId: parsedEvent.providerEventId,
      },
      `Webhook received: ${parsedEvent.eventType}`
    );

    switch (parsedEvent.eventType) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(
          parsedEvent.payload as StripeCheckoutSession
        );

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(
          parsedEvent.payload as StripeSubscription
        );

      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(
          parsedEvent.payload as StripeSubscription
        );

      case 'invoice.paid':
        return this.handleInvoicePaid(parsedEvent.payload as StripeInvoice);

      case 'invoice.payment_failed':
        return this.handleInvoicePaymentFailed(
          parsedEvent.payload as StripeInvoice
        );

      default:
        return { handled: false };
    }
  }

  private async handleCheckoutSessionCompleted(
    session: StripeCheckoutSession
  ): Promise<HandleWebhookEventOutput> {
    const { metadata } = session;

    Logger.debug(
      {
        requestMethod: 'process_checkout_session',
        requestStatus: 200,
        requestError: 'none',
        entityType: 'checkout_session',
        entityId: session.id,
      },
      `Processing checkout session ${session.id}`
    );

    if (!metadata?.userId || !metadata?.planId || !metadata?.planPriceId) {
      Logger.warn(
        {
          requestMethod: 'process_checkout_session',
          requestStatus: 400,
          requestError: 'missing_metadata',
          entityType: 'checkout_session',
          entityId: session.id,
        },
        'Checkout session missing required metadata'
      );
      return { handled: false };
    }

    const existingSubscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        session.subscription
      );

    if (existingSubscription) {
      return {
        handled: true,
        action: 'subscription_already_exists',
        entityId: existingSubscription.id,
      };
    }

    const subscription = await this.subscriptionRepository.create({
      userId: metadata.userId,
      planId: metadata.planId,
      planPriceId: metadata.planPriceId,
      status: 'active',
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
    });

    Logger.info(
      {
        requestMethod: 'create_subscription',
        requestStatus: 201,
        requestError: 'none',
        entityType: 'subscription',
        entityId: subscription.id,
      },
      `Subscription created for user ${metadata.userId}`
    );

    return {
      handled: true,
      action: 'subscription_created',
      entityId: subscription.id,
    };
  }

  private async handleSubscriptionUpdated(
    stripeSubscription: StripeSubscription
  ): Promise<HandleWebhookEventOutput> {
    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        stripeSubscription.id
      );

    if (!subscription) {
      if (
        stripeSubscription.metadata?.userId &&
        stripeSubscription.metadata?.planId &&
        stripeSubscription.metadata?.planPriceId
      ) {
        const newSubscription = await this.subscriptionRepository.create({
          userId: stripeSubscription.metadata.userId,
          planId: stripeSubscription.metadata.planId,
          planPriceId: stripeSubscription.metadata.planPriceId,
          status: this.mapStripeStatus(stripeSubscription.status),
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer,
          currentPeriodStart: new Date(
            stripeSubscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            stripeSubscription.current_period_end * 1000
          ),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        });

        return {
          handled: true,
          action: 'subscription_created',
          entityId: newSubscription.id,
        };
      }

      Logger.warn(
        {
          requestMethod: 'update_subscription',
          requestStatus: 404,
          requestError: 'not_found',
          entityType: 'subscription',
          entityId: stripeSubscription.id,
        },
        'Subscription not found and no metadata to create'
      );
      return { handled: false };
    }

    await this.subscriptionRepository.update(subscription.id, {
      status: this.mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    });

    return {
      handled: true,
      action: 'subscription_updated',
      entityId: subscription.id,
    };
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: StripeSubscription
  ): Promise<HandleWebhookEventOutput> {
    const updated =
      await this.subscriptionRepository.updateByStripeSubscriptionId(
        stripeSubscription.id,
        {
          status: 'canceled',
          canceledAt: new Date(),
        }
      );

    if (!updated) {
      Logger.warn(
        {
          requestMethod: 'delete_subscription',
          requestStatus: 404,
          requestError: 'not_found',
          entityType: 'subscription',
          entityId: stripeSubscription.id,
        },
        'Subscription not found for deletion'
      );
      return { handled: false };
    }

    return {
      handled: true,
      action: 'subscription_canceled',
      entityId: updated.id,
    };
  }

  private async handleInvoicePaid(
    invoice: StripeInvoice
  ): Promise<HandleWebhookEventOutput> {
    const existingPayment = await this.paymentRepository.findByStripeInvoiceId(
      invoice.id
    );

    if (existingPayment) {
      if (existingPayment.status !== 'succeeded') {
        await this.paymentRepository.update(existingPayment.id, {
          status: 'succeeded',
          paidAt: new Date(),
        });
      }
      return {
        handled: true,
        action: 'payment_already_exists',
        entityId: existingPayment.id,
      };
    }

    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        invoice.subscription
      );

    if (!subscription) {
      Logger.warn(
        {
          requestMethod: 'process_invoice',
          requestStatus: 404,
          requestError: 'subscription_not_found',
          entityType: 'invoice',
          entityId: invoice.id,
        },
        'Subscription not found for invoice'
      );
      return { handled: false };
    }

    const payment = await this.paymentRepository.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amountCents: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      paidAt: new Date(),
    });

    return {
      handled: true,
      action: 'payment_created',
      entityId: payment.id,
    };
  }

  private async handleInvoicePaymentFailed(
    invoice: StripeInvoice
  ): Promise<HandleWebhookEventOutput> {
    const existingPayment = await this.paymentRepository.findByStripeInvoiceId(
      invoice.id
    );

    if (existingPayment) {
      await this.paymentRepository.update(existingPayment.id, {
        status: 'failed',
      });
      return {
        handled: true,
        action: 'payment_marked_failed',
        entityId: existingPayment.id,
      };
    }

    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        invoice.subscription
      );

    if (!subscription) {
      Logger.warn(
        {
          requestMethod: 'process_failed_invoice',
          requestStatus: 404,
          requestError: 'subscription_not_found',
          entityType: 'invoice',
          entityId: invoice.id,
        },
        'Subscription not found for failed invoice'
      );
      return { handled: false };
    }

    const payment = await this.paymentRepository.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amountCents: invoice.amount_paid,
      currency: invoice.currency,
      status: 'failed',
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
    });

    return {
      handled: true,
      action: 'payment_failed_recorded',
      entityId: payment.id,
    };
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      past_due: 'past_due',
      paused: 'paused',
      trialing: 'trialing',
      unpaid: 'unpaid',
    };

    return statusMap[stripeStatus] ?? 'active';
  }
}
