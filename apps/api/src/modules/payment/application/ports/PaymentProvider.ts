export interface EnsureBillingIdentityInput {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface EnsureBillingIdentityOutput {
  billingIdentityId: string;
}

export interface CreateCheckoutSessionInput {
  billingIdentityId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionOutput {
  checkoutUrl: string;
  providerCheckoutSessionId: string;
}

export interface WebhookInput {
  headers: Record<string, string | string[] | undefined>;
  rawBody: Buffer;
}

export interface WebhookEventReferences {
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  providerInvoiceId?: string;
  providerPaymentId?: string;
}

export interface WebhookParsedEvent {
  providerEventId: string;
  eventType: string;
  payload: unknown;
  apiVersion?: string;
  liveMode?: boolean;
  references?: WebhookEventReferences;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  metadata?: Record<string, string>;
}

export interface CreateProductOutput {
  productId: string;
}

export interface CreatePriceInput {
  productId: string;
  currency: string;
  interval: string;
  amountCents: number;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface CreatePriceOutput {
  priceId: string;
}

export interface PaymentProvider {
  ensureBillingIdentity(
    input: EnsureBillingIdentityInput
  ): Promise<EnsureBillingIdentityOutput>;
  createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionOutput>;
  verifyAndParseWebhook(input: WebhookInput): Promise<WebhookParsedEvent>;
  createProduct(input: CreateProductInput): Promise<CreateProductOutput>;
  createPrice(input: CreatePriceInput): Promise<CreatePriceOutput>;
}
