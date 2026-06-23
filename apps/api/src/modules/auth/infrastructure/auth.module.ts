import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { IAuthProvider } from '../application/ports/authProvider.port';
import type { IRoleRepository } from '../application/ports/roleRepository.port';
import { GetCurrentUserUseCase } from '../application/use-case/getCurrentUser.useCase';
import { SignInUseCase } from '../application/use-case/signIn.useCase';
import { SignOutUseCase } from '../application/use-case/signOut.useCase';
import { SignUpUseCase } from '../application/use-case/signUp.useCase';
import { VerifyEmailCallbackUseCase } from '../application/use-case/verifyEmailCallback.useCase';
import { VerifyOtpUseCase } from '../application/use-case/verifyOtp.useCase';
import { createAuthProvider } from './factories/authProviderFactory';
import { AuthController } from './http/auth.controller';
import { registerAuthRoutes } from './http/auth.routes';
import { RolePostgresRepository } from './persistent/RolePostgresRepository';

declare module 'fastify' {
  interface FastifyInstance {
    authController: AuthController;
    authProvider: IAuthProvider;
    roleRepository: IRoleRepository;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    // Use shared Better Auth instance if available (from oauth-handler plugin)
    const authProvider = createAuthProvider({
      db: fastify.db,
      betterAuthInstance: fastify.betterAuthInstance,
    });

    const roleRepository = new RolePostgresRepository(fastify.db);

    const signInUseCase = new SignInUseCase(
      fastify.userRepository,
      authProvider
    );
    const signUpUseCase = new SignUpUseCase(
      fastify.userRepository,
      authProvider,
      roleRepository
    );
    const getCurrentUserUseCase = new GetCurrentUserUseCase(
      fastify.userRepository,
      authProvider
    );
    const signOutUseCase = new SignOutUseCase(authProvider);
    const verifyEmailCallbackUseCase = new VerifyEmailCallbackUseCase(
      fastify.userRepository,
      authProvider,
      roleRepository
    );
    const verifyOtpUseCase = new VerifyOtpUseCase(
      fastify.userRepository,
      authProvider,
      roleRepository
    );

    const authController = new AuthController(
      signInUseCase,
      signUpUseCase,
      getCurrentUserUseCase,
      signOutUseCase,
      verifyEmailCallbackUseCase,
      verifyOtpUseCase,
      roleRepository
    );

    fastify.decorate('authController', authController);
    fastify.decorate('authProvider', authProvider);
    fastify.decorate('roleRepository', roleRepository);

    await fastify.register(registerAuthRoutes, { prefix: 'v1/auth' });
  },
  { name: 'auth-module', dependencies: ['user-module'] }
);
