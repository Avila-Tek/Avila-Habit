import Stripe from 'stripe';
import {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionOutput,
  CreatePriceInput,
  CreatePriceOutput,
  CreateProductInput,
  CreateProductOutput,
  EnsureBillingIdentityInput,
  EnsureBillingIdentityOutput,
  PaymentProvider as PaymentProviderContract,
  WebhookEventReferences,
  WebhookInput,
  WebhookParsedEvent,
} from '../../../application/ports/PaymentProvider';
import { StripeConfig } from './StripeConfig';

export class StripePaymentProvider implements PaymentProviderContract {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey);
    this.webhookSecret = config.webhookSecret;
  }

  async ensureBillingIdentity(
    input: EnsureBillingIdentityInput
  ): Promise<EnsureBillingIdentityOutput> {
    const customer = await this.stripe.customers.create({
      email: input.email,
      name: input.name,
      metadata: input.metadata,
    });

    return {
      billingIdentityId: customer.id,
    };
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionOutput> {
    const session = await this.stripe.checkout.sessions.create({
      customer: input.billingIdentityId,
      mode: 'subscription',
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
    });

    if (!session.url) {
      throw new Error('Stripe checkout session URL is missing');
    }

    return {
      checkoutUrl: session.url,
      providerCheckoutSessionId: session.id,
    };
  }

  async createProduct(input: CreateProductInput): Promise<CreateProductOutput> {
    const product = await this.stripe.products.create({
      name: input.name,
      description: input.description ?? undefined,
      metadata: input.metadata,
    });

    return {
      productId: product.id,
    };
  }

  async createPrice(input: CreatePriceInput): Promise<CreatePriceOutput> {
    const recurring: Stripe.PriceCreateParams.Recurring = {
      interval: input.interval as Stripe.PriceCreateParams.Recurring.Interval,
    };

    if (input.trialDays !== undefined) {
      recurring.trial_period_days = input.trialDays;
    }

    const price = await this.stripe.prices.create({
      currency: input.currency.toLowerCase(),
      unit_amount: input.amountCents,
      product: input.productId,
      recurring,
      metadata: input.metadata,
    });

    return {
      priceId: price.id,
    };
  }

  async verifyAndParseWebhook(
    input: WebhookInput
  ): Promise<WebhookParsedEvent> {
    const signature = this.extractSignatureHeader(input.headers);

    const event = this.stripe.webhooks.constructEvent(
      input.rawBody,
      signature,
      this.webhookSecret
    );

    const references = this.extractReferences(event);

    return {
      providerEventId: event.id,
      eventType: event.type,
      payload: event.data.object,
      apiVersion: event.api_version ?? undefined,
      liveMode: event.livemode,
      references,
    };
  }

  private extractSignatureHeader(
    headers: Record<string, string | string[] | undefined>
  ): string {
    const signature = headers['stripe-signature'];

    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    if (Array.isArray(signature)) {
      const first = signature[0];
      if (!first) {
        throw new Error('Empty stripe-signature header array');
      }
      return first;
    }

    return signature;
  }

  private extractReferences(event: Stripe.Event): WebhookEventReferences {
    const references: WebhookEventReferences = {};
    const obj = event.data.object as unknown as Record<string, unknown>;

    if ('customer' in obj && typeof obj.customer === 'string') {
      references.providerCustomerId = obj.customer;
    }

    if ('id' in obj && typeof obj.id === 'string') {
      if (event.type.startsWith('customer.subscription')) {
        references.providerSubscriptionId = obj.id;
      } else if (event.type.startsWith('invoice')) {
        references.providerInvoiceId = obj.id;
      } else if (
        event.type.startsWith('payment_intent') ||
        event.type.startsWith('charge')
      ) {
        references.providerPaymentId = obj.id;
      }
    }

    if ('subscription' in obj && typeof obj.subscription === 'string') {
      references.providerSubscriptionId = obj.subscription;
    }

    if ('invoice' in obj && typeof obj.invoice === 'string') {
      references.providerInvoiceId = obj.invoice;
    }

    if ('payment_intent' in obj && typeof obj.payment_intent === 'string') {
      references.providerPaymentId = obj.payment_intent;
    }

    return references;
  }
}
