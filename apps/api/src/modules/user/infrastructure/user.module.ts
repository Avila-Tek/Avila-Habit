import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { RolePostgresRepository } from '@/modules/auth/infrastructure/persistent/RolePostgresRepository';
import type { IUserRepository } from '../application/ports/userRepository.port';
import { AssignRoleUseCase } from '../application/use-case/assignRole.useCase';
import { CreateUserUseCase } from '../application/use-case/createUser.useCase';
import { DeleteUserUseCase } from '../application/use-case/deleteUser.useCase';
import { FindUserUseCase } from '../application/use-case/findUser.useCase';
import { FindUsersUseCase } from '../application/use-case/findUsers.useCase';
import { UpdateUserUseCase } from '../application/use-case/updateUser.useCase';
import { UserController } from './http/user.controller';
import { registerUserRoutes } from './http/user.routes';
import { UserInternalAdapter } from './internal/UserInternalAdapter';
import { UserPostgresRepository } from './persistent/UserPostgresRepository';

declare module 'fastify' {
  interface FastifyInstance {
    userController: UserController;
    userRepository: IUserRepository;
    users: {
      adapter: UserInternalAdapter;
    };
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const userRepository = new UserPostgresRepository(fastify.db);
    const roleRepository = new RolePostgresRepository(fastify.db);

    const findUserUseCase = new FindUserUseCase(userRepository);
    const findUsersUseCase = new FindUsersUseCase(userRepository);
    const createUserUseCase = new CreateUserUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);
    const assignRoleUseCase = new AssignRoleUseCase(
      userRepository,
      roleRepository
    );

    const userController = new UserController(
      findUserUseCase,
      findUsersUseCase,
      updateUserUseCase,
      deleteUserUseCase,
      assignRoleUseCase
    );

    const userAdapter = new UserInternalAdapter(
      {
        findUserUseCase,
        createUserUseCase,
      },
      userRepository
    );

    fastify.decorate('userRepository', userRepository);
    fastify.decorate('userController', userController);
    fastify.decorate('users', { adapter: userAdapter });

    await fastify.register(registerUserRoutes, { prefix: 'v1/users' });
  },
  { name: 'user-module' }
);
