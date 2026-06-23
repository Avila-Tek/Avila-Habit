import fp from 'fastify-plugin';
import { envs } from '@/config';
import type { PaymentRepository } from './application/ports/PaymentRepository';
import type { SubscriptionRepository } from './application/ports/SubscriptionRepository';
import { PaymentController } from './infrastructure/http/PaymentController';
import rawBodyPlugin from './infrastructure/http/plugins/rawBodyPlugin';
import { registerPaymentRoutes } from './infrastructure/http/routes';
import { PaymentPostgresRepository } from './infrastructure/persistence/PaymentPostgresRepository';
import { SubscriptionPostgresRepository } from './infrastructure/persistence/SubscriptionPostgresRepository';
import { StripePaymentProvider } from './infrastructure/providers/stripe/StripePaymentProvider';
import { PaymentProviderRegistry } from './infrastructure/registry/PaymentProviderRegistry';

declare module 'fastify' {
  interface FastifyInstance {
    payment: {
      registry: PaymentProviderRegistry;
      subscriptionRepository: SubscriptionRepository;
      paymentRepository: PaymentRepository;
    };
  }
}

export default fp(
  async (fastify) => {
    const registry = new PaymentProviderRegistry();
    const subscriptionRepository = new SubscriptionPostgresRepository(
      fastify.db
    );
    const paymentRepository = new PaymentPostgresRepository(fastify.db);

    fastify.decorate('payment', {
      registry,
      subscriptionRepository,
      paymentRepository,
    });

    const secretKey = envs.stripe.secretKey;
    const webhookSecret = envs.stripe.webhookSecret;

    if (!secretKey || !webhookSecret) {
      fastify.log.warn(
        'Stripe credentials are missing. Payment module routes will not be registered.'
      );
      return;
    }

    const stripeProvider = new StripePaymentProvider({
      secretKey,
      webhookSecret,
    });

    registry.register('stripe', stripeProvider);

    const controller = new PaymentController({
      registry,
      subscriptionRepository,
      paymentRepository,
    });

    await fastify.register(rawBodyPlugin);
    fastify.register(registerPaymentRoutes(controller), { prefix: '/api/v1' });
  },
  {
    name: 'payment-module',
    dependencies: ['database'],
  }
);
