import type {
  TCreatePlanInput,
  TCreatePlanPriceInput,
  TPlanIdParams,
  TPlanPriceIdParams,
  TUpdatePlanInput,
  TUpdatePlanPriceInput,
} from '@repo/schemas';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '@/modules/shared/domain/errors/domainError';
import { CreatePlanPriceUseCase } from '../../application/useCases/CreatePlanPriceUseCase';
import { CreatePlanUseCase } from '../../application/useCases/CreatePlanUseCase';
import { DeletePlanPriceUseCase } from '../../application/useCases/DeletePlanPriceUseCase';
import { DeletePlanUseCase } from '../../application/useCases/DeletePlanUseCase';
import { GetPlanByIdUseCase } from '../../application/useCases/GetPlanByIdUseCase';
import { ListPlansCatalogUseCase } from '../../application/useCases/ListPlansCatalogUseCase';
import { UpdatePlanPriceUseCase } from '../../application/useCases/UpdatePlanPriceUseCase';
import { UpdatePlanUseCase } from '../../application/useCases/UpdatePlanUseCase';
import { PlanMapper } from '../mappers/plan.mapper';

interface PlanUseCases {
  createPlan: CreatePlanUseCase;
  updatePlan: UpdatePlanUseCase;
  deletePlan: DeletePlanUseCase;
  getPlanById: GetPlanByIdUseCase;
  listPlansCatalog: ListPlansCatalogUseCase;
  createPlanPrice: CreatePlanPriceUseCase;
  updatePlanPrice: UpdatePlanPriceUseCase;
  deletePlanPrice: DeletePlanPriceUseCase;
}

export class PlanController {
  private useCases: PlanUseCases;

  constructor(useCases: PlanUseCases) {
    this.useCases = useCases;
  }

  async listCatalog(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.useCases.listPlansCatalog.execute();
    return reply.send({ plans: result });
  }

  async getPlanById(
    request: FastifyRequest<{ Params: TPlanIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { planId } = request.params;
      const result = await this.useCases.getPlanById.execute({ id: planId });

      return reply.send({
        success: true,
        data: PlanMapper.toCatalogItem(result),
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(error.status).send(error.toJSON());
      }
      throw error;
    }
  }

  async createPlan(
    request: FastifyRequest<{ Body: TCreatePlanInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.useCases.createPlan.execute(request.body);
    return reply.status(201).send(result);
  }

  async updatePlan(
    request: FastifyRequest<{ Params: TPlanIdParams; Body: TUpdatePlanInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const { planId } = request.params;
    const result = await this.useCases.updatePlan.execute({
      id: planId,
      ...request.body,
    });
    return reply.send(result);
  }

  async deletePlan(
    request: FastifyRequest<{ Params: TPlanIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { planId } = request.params;
    await this.useCases.deletePlan.execute({ id: planId });
    return reply.status(204).send();
  }

  async createPlanPrice(
    request: FastifyRequest<{
      Params: TPlanIdParams;
      Body: TCreatePlanPriceInput;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { planId } = request.params;
    const result = await this.useCases.createPlanPrice.execute({
      planId,
      ...request.body,
    });
    return reply.status(201).send(result);
  }

  async updatePlanPrice(
    request: FastifyRequest<{
      Params: TPlanPriceIdParams;
      Body: TUpdatePlanPriceInput;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { planPriceId } = request.params;
    const result = await this.useCases.updatePlanPrice.execute({
      id: planPriceId,
      ...request.body,
    });
    return reply.send(result);
  }

  async deletePlanPrice(
    request: FastifyRequest<{ Params: TPlanPriceIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { planPriceId } = request.params;
    await this.useCases.deletePlanPrice.execute({ id: planPriceId });
    return reply.status(204).send();
  }
}
