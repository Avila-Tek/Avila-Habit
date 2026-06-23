import fp from 'fastify-plugin';
import { envs } from '@/config';
import { BillingController } from './infrastructure/http/BillingController';
import rawBodyPlugin from './infrastructure/http/plugins/rawBodyPlugin';
import { registerBillingRoutes } from './infrastructure/http/routes';
import { StripeBillingProvider } from './infrastructure/providers/stripe/StripeBillingProvider';
import { BillingProviderRegistry } from './infrastructure/registry/BillingProviderRegistry';

declare module 'fastify' {
  interface FastifyInstance {
    billing: {
      registry: BillingProviderRegistry;
    };
  }
}

export default fp(
  async (fastify) => {
    const secretKey = envs.stripe.secretKey;
    const webhookSecret = envs.stripe.webhookSecret;

    if (!secretKey || !webhookSecret) {
      fastify.log.warn(
        'Stripe credentials are missing. Billing module routes will not be registered.'
      );
      return;
    }

    const stripeProvider = new StripeBillingProvider({
      secretKey,
      webhookSecret,
    });

    const registry = new BillingProviderRegistry();
    registry.register('stripe', stripeProvider);

    const controller = new BillingController({
      registry,
      subscriptionRepository: fastify.payment.subscriptionRepository,
      paymentRepository: fastify.payment.paymentRepository,
    });

    fastify.decorate('billing', { registry });

    await fastify.register(rawBodyPlugin);
    fastify.register(registerBillingRoutes(controller), { prefix: '/api/v1' });
  },
  {
    name: 'billing-module',
    dependencies: ['payment-module'],
  }
);
