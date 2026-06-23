import { FastifyInstance } from 'fastify';
import { UserService } from '../../application/ports/UserService';
import { AuthenticatedUserEntity } from '../../domain/entities/AuthenticatedUserEntity';
import { NewUserEntity } from '../../domain/entities/NewUserEntity';

export class UserServiceMediator implements UserService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async findByEmail(email: string) {
    const useCase = this.getAdapters().findUserByEmailUseCase;
    const user = await useCase.execute(email);
    if (!user) return null;

    return AuthenticatedUserEntity.create({
      id: user.id,
      email: user.email,
      password: user.password,
    });
  }

  async findById(id: string) {
    const useCase = this.getAdapters().findUserByIdUseCase;
    const user = await useCase.execute(id);
    if (!user) return null;

    return AuthenticatedUserEntity.create({
      id: user.id,
      email: user.email,
      password: user.password,
    });
  }

  async create(input: NewUserEntity) {
    const _input = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toString(),
      password: input.password.toString(),
    };

    const useCase = this.getAdapters().registerUserUseCase;
    const user = await useCase.execute(_input);
    if (!user) return null;

    return AuthenticatedUserEntity.create({
      id: user.id,
      email: user.email,
      password: user.password,
    });
  }

  private getAdapters() {
    return this.fastify.users.adapters;
  }
}
