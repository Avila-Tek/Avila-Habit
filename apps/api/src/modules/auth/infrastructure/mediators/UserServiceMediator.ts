import type { FastifyInstance } from 'fastify';
import type {
  CreateUserWithHashedPasswordInput,
  UserService,
} from '../../application/ports/UserService';
import { AuthenticatedUserEntity } from '../../domain/entities/AuthenticatedUserEntity';

export class UserServiceMediator implements UserService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async findById(id: string): Promise<AuthenticatedUserEntity | null> {
    const user = await this.getAdapter().findUserById(id);
    if (!user) return null;

    return this.mapUserToAuthenticatedEntity(user);
  }

  async findByIdWithPassword(
    id: string
  ): Promise<AuthenticatedUserEntity | null> {
    const user = await this.getAdapter().findUserByIdWithPassword(id);
    if (!user) return null;

    return this.mapUserToAuthenticatedEntity(user);
  }

  async findByEmail(email: string): Promise<AuthenticatedUserEntity | null> {
    const user = await this.getAdapter().findUserByEmail(email);
    if (!user) return null;

    return this.mapUserToAuthenticatedEntity(user);
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<AuthenticatedUserEntity | null> {
    const user = await this.getAdapter().findUserByEmailWithPassword(email);
    if (!user) return null;

    return this.mapUserToAuthenticatedEntity(user);
  }

  async createWithHashedPassword(
    input: CreateUserWithHashedPasswordInput
  ): Promise<AuthenticatedUserEntity | null> {
    const user = await this.getAdapter().createUser({
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash: input.hashedPassword,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
    });
    if (!user) return null;

    return this.mapUserToAuthenticatedEntity(user);
  }

  async exists(email: string): Promise<boolean> {
    return this.getAdapter().userExists(email);
  }

  private mapUserToAuthenticatedEntity(user: {
    id: { value: string };
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthenticatedUserEntity {
    return AuthenticatedUserEntity.create({
      id: user.id.value,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      password: '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  private getAdapter() {
    return this.fastify.users.adapter;
  }
}
