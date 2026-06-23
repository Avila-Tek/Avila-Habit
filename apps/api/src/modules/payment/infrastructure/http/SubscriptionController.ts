import { FastifyReply, FastifyRequest } from 'fastify';
import type { PaymentProvider } from '@/modules/payment/application/ports/PaymentProvider';
import type { SubscriptionRepository } from '@/modules/payment/application/ports/SubscriptionRepository';
import {
  type GetUserSubscriptionInput,
  GetUserSubscriptionUseCase,
} from '@/modules/payment/application/use-case/getUserSubscription.useCase';
import {
  type SubscribeToPlanInput,
  SubscribeToPlanUseCase,
} from '@/modules/payment/application/use-case/subscribeToPlan.useCase';
import type { PlanPriceRepository } from '@/modules/plan/application/ports/PlanPriceRepository';
import type { PlanRepository } from '@/modules/plan/application/ports/PlanRepository';
import type { User } from '@/modules/user/domain/entities/user.entity';

interface SubscribeToPlanBody {
  planId: string;
  planPriceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface SubscriptionControllerDependencies {
  planRepository: PlanRepository;
  planPriceRepository: PlanPriceRepository;
  subscriptionRepository: SubscriptionRepository;
  paymentProvider: PaymentProvider;
}

export class SubscriptionController {
  private planRepository: PlanRepository;
  private planPriceRepository: PlanPriceRepository;
  private subscriptionRepository: SubscriptionRepository;
  private paymentProvider: PaymentProvider;

  constructor(deps: SubscriptionControllerDependencies) {
    this.planRepository = deps.planRepository;
    this.planPriceRepository = deps.planPriceRepository;
    this.subscriptionRepository = deps.subscriptionRepository;
    this.paymentProvider = deps.paymentProvider;
  }

  async subscribe(
    request: FastifyRequest<{ Body: SubscribeToPlanBody }> & { user?: User },
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const useCase = new SubscribeToPlanUseCase(
      this.planRepository,
      this.planPriceRepository,
      this.subscriptionRepository,
      this.paymentProvider
    );

    const input: SubscribeToPlanInput = {
      userId: user.id.value,
      userEmail: user.email,
      userName: user.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : undefined,
      planId: request.body.planId,
      planPriceId: request.body.planPriceId,
      successUrl: request.body.successUrl,
      cancelUrl: request.body.cancelUrl,
    };

    const result = await useCase.execute(input);

    if (result.type === 'free_subscription_created') {
      return reply.status(201).send({
        type: result.type,
        subscriptionId: result.subscriptionId,
      });
    }

    return reply.send({
      type: result.type,
      checkoutUrl: result.checkoutUrl,
      checkoutSessionId: result.checkoutSessionId,
    });
  }

  async getCurrentSubscription(
    request: FastifyRequest & { user?: User },
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const useCase = new GetUserSubscriptionUseCase(
      this.subscriptionRepository,
      this.planRepository,
      this.planPriceRepository
    );

    const input: GetUserSubscriptionInput = {
      userId: user.id.value,
    };

    const result = await useCase.execute(input);

    if (!result) {
      return reply.status(404).send({ error: 'No active subscription found' });
    }

    return reply.send(result);
  }
}
