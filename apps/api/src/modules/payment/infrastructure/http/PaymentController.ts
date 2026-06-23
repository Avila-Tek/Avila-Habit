import type {
  TPaymentCheckoutSessionInput,
  TPaymentEnsureIdentityInput,
  TPaymentProviderParams,
} from '@repo/schemas';
import { FastifyReply, FastifyRequest } from 'fastify';
import type { PaymentRepository } from '@/modules/payment/application/ports/PaymentRepository';
import type { SubscriptionRepository } from '@/modules/payment/application/ports/SubscriptionRepository';
import { CreateCheckoutSessionUseCase } from '@/modules/payment/application/use-case/CreateCheckoutSessionUseCase';
import { EnsureBillingIdentityUseCase } from '@/modules/payment/application/use-case/EnsureBillingIdentityUseCase';
import { HandleWebhookEventUseCase } from '@/modules/payment/application/use-case/HandleWebhookEventUseCase';
import { ParseWebhookUseCase } from '@/modules/payment/application/use-case/ParseWebhookUseCase';
import { PaymentProviderRegistry } from '@/modules/payment/infrastructure/registry/PaymentProviderRegistry';

interface PaymentControllerDependencies {
  registry: PaymentProviderRegistry;
  subscriptionRepository: SubscriptionRepository;
  paymentRepository: PaymentRepository;
}

export class PaymentController {
  private registry: PaymentProviderRegistry;
  private subscriptionRepository: SubscriptionRepository;
  private paymentRepository: PaymentRepository;

  constructor(deps: PaymentControllerDependencies) {
    this.registry = deps.registry;
    this.subscriptionRepository = deps.subscriptionRepository;
    this.paymentRepository = deps.paymentRepository;
  }

  async createCheckoutSession(
    request: FastifyRequest<{
      Body: TPaymentCheckoutSessionInput;
      Params: TPaymentProviderParams;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { provider } = request.params;
    const paymentProvider = this.registry.get(provider);

    const useCase = new CreateCheckoutSessionUseCase(paymentProvider);
    const result = await useCase.execute(request.body);

    return reply.send(result);
  }

  async handleWebhook(
    request: FastifyRequest<{ Params: TPaymentProviderParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { provider } = request.params;

    if (!this.registry.has(provider)) {
      return reply.status(400).send({ error: `Unknown provider: ${provider}` });
    }

    const paymentProvider = this.registry.get(provider);
    const parseUseCase = new ParseWebhookUseCase(paymentProvider);

    const rawBody = (request as FastifyRequest & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      return reply.status(400).send({ error: 'Missing raw body' });
    }

    const parsedEvent = await parseUseCase.execute({
      headers: request.headers as Record<string, string | string[] | undefined>,
      rawBody,
    });

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
      Body: TPaymentEnsureIdentityInput;
      Params: TPaymentProviderParams;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { provider } = request.params;
    const paymentProvider = this.registry.get(provider);

    const useCase = new EnsureBillingIdentityUseCase(paymentProvider);
    const result = await useCase.execute(request.body ?? {});

    return reply.send(result);
  }
}
