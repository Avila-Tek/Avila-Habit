import type {
  TBillingCheckoutSessionInput,
  TBillingEnsureIdentityInput,
  TBillingProviderParams,
} from '@repo/schemas';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateCheckoutSessionUseCase } from '@/modules/billing/application/use-case/CreateCheckoutSessionUseCase';
import { EnsureBillingIdentityUseCase } from '@/modules/billing/application/use-case/EnsureBillingIdentityUseCase';
import { ParseWebhookUseCase } from '@/modules/billing/application/use-case/ParseWebhookUseCase';
import { BillingProviderRegistry } from '@/modules/billing/infrastructure/registry/BillingProviderRegistry';
import type { PaymentRepository } from '@/modules/payment/application/ports/PaymentRepository';
import type { SubscriptionRepository } from '@/modules/payment/application/ports/SubscriptionRepository';
import { HandleWebhookEventUseCase } from '@/modules/payment/application/use-case/HandleWebhookEventUseCase';

interface BillingControllerDeps {
  registry: BillingProviderRegistry;
  subscriptionRepository: SubscriptionRepository;
  paymentRepository: PaymentRepository;
}

export class BillingController {
  private registry: BillingProviderRegistry;
  private subscriptionRepository: SubscriptionRepository;
  private paymentRepository: PaymentRepository;

  constructor(deps: BillingControllerDeps) {
    this.registry = deps.registry;
    this.subscriptionRepository = deps.subscriptionRepository;
    this.paymentRepository = deps.paymentRepository;
  }

  async createCheckoutSession(
    request: FastifyRequest<{
      Body: TBillingCheckoutSessionInput;
      Params: TBillingProviderParams;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { provider } = request.params;
    const billingProvider = this.registry.get(provider);

    const useCase = new CreateCheckoutSessionUseCase(billingProvider);
    const result = await useCase.execute(request.body);

    return reply.send(result);
  }

  async handleWebhook(
    request: FastifyRequest<{ Params: TBillingProviderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { provider } = request.params;

    if (!this.registry.has(provider)) {
      return reply.status(400).send({ error: `Unknown provider: ${provider}` });
    }

    const billingProvider = this.registry.get(provider);
    const parseUseCase = new ParseWebhookUseCase(billingProvider);

    const rawBody = (request as FastifyRequest & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      return reply.status(400).send({ error: 'Missing raw body' });
    }

    const parsedEvent = await parseUseCase.execute({
      headers: request.headers as Record<string, string | string[] | undefined>,
      rawBody,
    });

    // Process the webhook event (create subscriptions, payments, etc.)
    const handleUseCase = new HandleWebhookEventUseCase(
      this.subscriptionRepository,
      this.paymentRepository
    );

    const result = await handleUseCase.execute({ parsedEvent });

    return reply.send({
      providerEventId: parsedEvent.providerEventId,
      eventType: parsedEvent.eventType,
      handled: result.handled,
      action: result.action,
    });
  }

  async ensureBillingIdentity(
    request: FastifyRequest<{
      Body: TBillingEnsureIdentityInput;
      Params: TBillingProviderParams;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { provider } = request.params;
    const billingProvider = this.registry.get(provider);

    const useCase = new EnsureBillingIdentityUseCase(billingProvider);
    const result = await useCase.execute(request.body ?? {});

    return reply.send(result);
  }
}
