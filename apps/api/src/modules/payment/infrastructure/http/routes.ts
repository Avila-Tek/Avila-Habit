import { FastifyInstance } from 'fastify';
import { validateUser } from '@/plugins/routes/middlewares/auth.middleware';
import { PaymentController } from './PaymentController';
import { SubscriptionController } from './SubscriptionController';

export function registerPaymentRoutes(controller: PaymentController) {
  return async function (fastify: FastifyInstance): Promise<void> {
    fastify.post(
      '/payment/:provider/checkout-session',
      controller.createCheckoutSession.bind(controller)
    );

    fastify.post(
      '/payment/:provider/customers',
      controller.ensureBillingIdentity.bind(controller)
    );

    fastify.post(
      '/payment/webhooks/:provider',
      {
        config: {
          rawBody: true,
        },
      },
      controller.handleWebhook.bind(controller)
    );
  };
}

export function registerSubscriptionRoutes(controller: SubscriptionController) {
  return async function (fastify: FastifyInstance): Promise<void> {
    const authPreHandler = validateUser(fastify);

    // Subscribe to a plan (handles both free and paid)
    fastify.post(
      '/subscriptions/subscribe',
      { preHandler: authPreHandler },
      async (request, reply) => {
        return controller.subscribe(request as any, reply);
      }
    );

    // Get current user subscription
    fastify.get(
      '/subscriptions/current',
      { preHandler: authPreHandler },
      async (request, reply) => {
        return controller.getCurrentSubscription(request as any, reply);
      }
    );
  };
}
