import { PaymentProvider, WebhookParsedEvent } from '../ports/PaymentProvider';

interface ParseWebhookUseCaseInput {
  headers: Record<string, string | string[] | undefined>;
  rawBody: Buffer;
}

export class ParseWebhookUseCase {
  private paymentProvider: PaymentProvider;

  constructor(paymentProvider: PaymentProvider) {
    this.paymentProvider = paymentProvider;
  }

  async execute(input: ParseWebhookUseCaseInput): Promise<WebhookParsedEvent> {
    return this.paymentProvider.verifyAndParseWebhook({
      headers: input.headers,
      rawBody: input.rawBody,
    });
  }
}
