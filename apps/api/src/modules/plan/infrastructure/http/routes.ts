import { FastifyInstance } from 'fastify';
import { PlanController } from './PlanController';

export function registerPlanRoutes(controller: PlanController) {
  return async function (fastify: FastifyInstance) {
    // Public catalog
    fastify.get('/plans', controller.listCatalog.bind(controller));
    fastify.get('/plans/:planId', controller.getPlanById.bind(controller));

    // Admin - Plans CRUD
    fastify.post('/admin/plans', controller.createPlan.bind(controller));
    fastify.patch(
      '/admin/plans/:planId',
      controller.updatePlan.bind(controller)
    );
    fastify.delete(
      '/admin/plans/:planId',
      controller.deletePlan.bind(controller)
    );

    // Admin - Plan Prices CRUD
    fastify.post(
      '/admin/plans/:planId/prices',
      controller.createPlanPrice.bind(controller)
    );
    fastify.patch(
      '/admin/planPrices/:planPriceId',
      controller.updatePlanPrice.bind(controller)
    );
    fastify.delete(
      '/admin/planPrices/:planPriceId',
      controller.deletePlanPrice.bind(controller)
    );
  };
}
