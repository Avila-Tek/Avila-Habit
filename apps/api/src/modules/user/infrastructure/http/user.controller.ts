import type {
  TAssignRoleInput,
  TPaginationInput,
  TUpdateUserInput,
  TUserIdParams,
} from '@repo/schemas';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAssignRoleUseCase } from '@/modules/user/application/ports/assignRole.port';
import type { IDeleteUserUseCase } from '@/modules/user/application/ports/deleteUser.port';
import type { IFindUserUseCase } from '@/modules/user/application/ports/findUser.port';
import type { IFindUsersUseCase } from '@/modules/user/application/ports/findUsers.port';
import type { IUpdateUserUseCase } from '@/modules/user/application/ports/updateUser.port';
import { UserMapper } from '../mappers/user.mapper';

export class UserController {
  constructor(
    private readonly findUserUseCase: IFindUserUseCase,
    private readonly findUsersUseCase: IFindUsersUseCase,
    private readonly updateUserUseCase: IUpdateUserUseCase,
    private readonly deleteUserUseCase: IDeleteUserUseCase,
    private readonly assignRoleUseCase: IAssignRoleUseCase
  ) {
    this.findMany = this.findMany.bind(this);
    this.findOne = this.findOne.bind(this);
    this.updateOne = this.updateOne.bind(this);
    this.deleteOne = this.deleteOne.bind(this);
    this.assignRole = this.assignRole.bind(this);
  }

  async findMany(
    request: FastifyRequest<{ Querystring: TPaginationInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const page = request.query.page ?? 1;
    const limit = request.query.perPage ?? 10;

    const result = await this.findUsersUseCase.execute({ page, limit });

    reply.status(200).send({
      success: true,
      data: {
        data: UserMapper.toResponseList(result.data),
        pagination: result.pagination,
      },
    });
  }

  async findOne(
    request: FastifyRequest<{ Params: TUserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = await this.findUserUseCase.execute({ id: request.params.id });

    reply.status(200).send({
      success: true,
      data: UserMapper.toResponse(user),
    });
  }

  async updateOne(
    request: FastifyRequest<{ Params: TUserIdParams; Body: TUpdateUserInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = await this.updateUserUseCase.execute({
      id: request.params.id,
      ...request.body,
    });

    reply.status(200).send({
      success: true,
      data: UserMapper.toResponse(user),
    });
  }

  async deleteOne(
    request: FastifyRequest<{ Params: TUserIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    await this.deleteUserUseCase.execute({ id: request.params.id });

    reply.status(200).send({
      success: true,
      data: {},
    });
  }

  async assignRole(
    request: FastifyRequest<{ Params: TUserIdParams; Body: TAssignRoleInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = await this.assignRoleUseCase.execute({
      userId: request.params.id,
      roleCode: request.body.roleCode,
    });

    reply.status(200).send({
      success: true,
      data: UserMapper.toResponse(user),
    });
  }
}
