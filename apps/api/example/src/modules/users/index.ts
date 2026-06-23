import fp from 'fastify-plugin';
import { FindUserByEmailUseCase } from './application/use-case/FindUserByEmailUseCase';
import { FindUserByIdUseCase } from './application/use-case/FindUserByIdUseCase';
import { RegisterUserUseCase } from './application/use-case/RegisterUserUseCase';
import { UpdateUserUseCase } from './application/use-case/UpdateUserUseCase';
import { UserAmazingDBRepository } from './infrastructure/persistent/UserAmazingDBRepository';

declare module 'fastify' {
  interface FastifyInstance {
    users: {
      adapters: {
        findUserByIdUseCase: FindUserByIdUseCase;
        findUserByEmailUseCase: FindUserByEmailUseCase;
        registerUserUseCase: RegisterUserUseCase;
        updateUserUseCase: UpdateUserUseCase;
      };
    };
  }
}

export default fp(async (fastify) => {
  const userRepository = new UserAmazingDBRepository();
  const findUserByIdUseCase = new FindUserByIdUseCase(userRepository);
  const findUserByEmailUseCase = new FindUserByEmailUseCase(userRepository);
  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);

  fastify.decorate('users', {
    adapters: {
      findUserByIdUseCase,
      findUserByEmailUseCase,
      registerUserUseCase,
      updateUserUseCase,
    },
  });
});
