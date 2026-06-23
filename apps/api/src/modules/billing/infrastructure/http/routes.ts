import { FastifyInstance } from 'fastify';
import { BillingController } from './BillingController';

export function registerBillingRoutes(controller: BillingController) {
  return async function (fastify: FastifyInstance): Promise<void> {
    fastify.post(
      '/billing/:provider/checkout-session',
      controller.createCheckoutSession.bind(controller)
    );

    fastify.post(
      '/billing/:provider/customers',
      controller.ensureBillingIdentity.bind(controller)
    );

    fastify.post(
      '/billing/webhooks/:provider',
      {
        config: {
          rawBody: true,
        },
      },
      controller.handleWebhook.bind(controller)
    );
  };
}
