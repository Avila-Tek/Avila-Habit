import fp from 'fastify-plugin';
import { CurrentUserUseCase } from './application/use-case/CurrentUserUsaCase';
import { SignInUseCase } from './application/use-case/SignInUseCase';
import { SignUpUseCase } from './application/use-case/SignUpUseCase';
import { PasswordHasher } from './infrastructure/hash/PasswordHasher';
import { AuthController } from './infrastructure/http/AuthController';
import { registerAuthRoutes } from './infrastructure/http/routes';
import { UserServiceMediator } from './infrastructure/mediators/UserServiceMediator';
import { SessionAmazingDBRepository } from './infrastructure/persistent/TokenAmazingDBRepository';
import { TokenHandler } from './infrastructure/token/TokenHandler';

declare module 'fastify' {
  interface FastifyInstance {
    auth: {
      adapters: {
        currentUser: CurrentUserUseCase;
      };
    };
  }
}

export default fp(async (fastify) => {
  const userServiceProxy = new UserServiceMediator(fastify);
  const passwordHasher = new PasswordHasher();
  const tokenHandler = new TokenHandler();

  const sessionRepository = new SessionAmazingDBRepository();
  const signInUseCase = new SignInUseCase(
    userServiceProxy,
    passwordHasher,
    sessionRepository,
    tokenHandler
  );
  const currentUserUseCase = new CurrentUserUseCase(
    userServiceProxy,
    sessionRepository,
    tokenHandler
  );
  const signUpUseCase = new SignUpUseCase(
    userServiceProxy,
    passwordHasher,
    sessionRepository,
    tokenHandler
  );

  const controller = new AuthController({
    signIn: signInUseCase,
    signUp: signUpUseCase,
    currentUser: currentUserUseCase,
  });

  fastify.decorate('auth', { adapters: { currentUser: currentUserUseCase } });
  fastify.register(registerAuthRoutes(controller), { prefix: '/api' });
});
