import fp from 'fastify-plugin';
import { GetUserSubscriptionUseCase } from '@/modules/payment/application/use-case/getUserSubscription.useCase';
import { registerSubscriptionRoutes } from '@/modules/payment/infrastructure/http/routes';
import { SubscriptionController } from '@/modules/payment/infrastructure/http/SubscriptionController';
import { CreatePlanPriceUseCase } from './application/useCases/CreatePlanPriceUseCase';
import { CreatePlanUseCase } from './application/useCases/CreatePlanUseCase';
import { DeletePlanPriceUseCase } from './application/useCases/DeletePlanPriceUseCase';
import { DeletePlanUseCase } from './application/useCases/DeletePlanUseCase';
import { GetPlanByIdUseCase } from './application/useCases/GetPlanByIdUseCase';
import { ListPlansCatalogUseCase } from './application/useCases/ListPlansCatalogUseCase';
import { UpdatePlanPriceUseCase } from './application/useCases/UpdatePlanPriceUseCase';
import { UpdatePlanUseCase } from './application/useCases/UpdatePlanUseCase';
import { PlanController } from './infrastructure/http/PlanController';
import { registerPlanRoutes } from './infrastructure/http/routes';
import { PlanPostgresRepository } from './infrastructure/persistence/PlanPostgresRepository';
import { PlanPricePostgresRepository } from './infrastructure/persistence/PlanPricePostgresRepository';

declare module 'fastify' {
  interface FastifyInstance {
    plan: {
      useCases: {
        createPlan: CreatePlanUseCase;
        updatePlan: UpdatePlanUseCase;
        deletePlan: DeletePlanUseCase;
        getPlanById: GetPlanByIdUseCase;
        listPlansCatalog: ListPlansCatalogUseCase;
        createPlanPrice: CreatePlanPriceUseCase;
        updatePlanPrice: UpdatePlanPriceUseCase;
        deletePlanPrice: DeletePlanPriceUseCase;
        getUserSubscription: GetUserSubscriptionUseCase;
      };
    };
  }
}

export default fp(
  async (fastify) => {
    const planRepository = new PlanPostgresRepository(fastify.db);
    const planPriceRepository = new PlanPricePostgresRepository(fastify.db);

    const stripeProvider = fastify.payment.registry.get('stripe');
    if (!stripeProvider) {
      throw new Error(
        'Stripe payment provider is not registered. Please configure Stripe credentials.'
      );
    }

    const createPlanUseCase = new CreatePlanUseCase(
      planRepository,
      stripeProvider
    );
    const updatePlanUseCase = new UpdatePlanUseCase(planRepository);
    const deletePlanUseCase = new DeletePlanUseCase(planRepository);
    const getPlanByIdUseCase = new GetPlanByIdUseCase(planRepository);
    const listPlansCatalogUseCase = new ListPlansCatalogUseCase(planRepository);
    const createPlanPriceUseCase = new CreatePlanPriceUseCase(
      planRepository,
      planPriceRepository,
      stripeProvider
    );
    const updatePlanPriceUseCase = new UpdatePlanPriceUseCase(
      planPriceRepository
    );
    const deletePlanPriceUseCase = new DeletePlanPriceUseCase(
      planPriceRepository
    );
    const getUserSubscriptionUseCase = new GetUserSubscriptionUseCase(
      fastify.payment.subscriptionRepository,
      planRepository,
      planPriceRepository
    );

    const controller = new PlanController({
      createPlan: createPlanUseCase,
      updatePlan: updatePlanUseCase,
      deletePlan: deletePlanUseCase,
      getPlanById: getPlanByIdUseCase,
      listPlansCatalog: listPlansCatalogUseCase,
      createPlanPrice: createPlanPriceUseCase,
      updatePlanPrice: updatePlanPriceUseCase,
      deletePlanPrice: deletePlanPriceUseCase,
    });

    fastify.decorate('plan', {
      useCases: {
        createPlan: createPlanUseCase,
        updatePlan: updatePlanUseCase,
        deletePlan: deletePlanUseCase,
        getPlanById: getPlanByIdUseCase,
        listPlansCatalog: listPlansCatalogUseCase,
        createPlanPrice: createPlanPriceUseCase,
        updatePlanPrice: updatePlanPriceUseCase,
        deletePlanPrice: deletePlanPriceUseCase,
        getUserSubscription: getUserSubscriptionUseCase,
      },
    });

    fastify.register(registerPlanRoutes(controller), { prefix: '/api/v1' });

    // Register subscription routes
    const subscriptionController = new SubscriptionController({
      planRepository,
      planPriceRepository,
      subscriptionRepository: fastify.payment.subscriptionRepository,
      paymentProvider: stripeProvider,
    });

    fastify.register(registerSubscriptionRoutes(subscriptionController), {
      prefix: '/api/v1',
    });
  },
  {
    name: 'plan-module',
    dependencies: ['database', 'payment-module'],
  }
);
