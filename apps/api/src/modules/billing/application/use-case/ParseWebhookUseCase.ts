import { BillingProvider, WebhookParsedEvent } from '../ports/BillingProvider';

interface ParseWebhookUseCaseInput {
  headers: Record<string, string | string[] | undefined>;
  rawBody: Buffer;
}

export class ParseWebhookUseCase {
  private billingProvider: BillingProvider;

  constructor(billingProvider: BillingProvider) {
    this.billingProvider = billingProvider;
  }

  async execute(input: ParseWebhookUseCaseInput): Promise<WebhookParsedEvent> {
    return this.billingProvider.verifyAndParseWebhook({
      headers: input.headers,
      rawBody: input.rawBody,
    });
  }
}
