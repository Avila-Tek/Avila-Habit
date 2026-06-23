import type { FastifyInstance, FastifyRequest } from 'fastify';
import { GetCurrentUserUseCase } from '@/modules/auth/application/use-case/getCurrentUser.useCase';
import { createAuthProvider } from '@/modules/auth/infrastructure/factories/authProviderFactory';
import type { User } from '@/modules/user/domain/entities/user.entity';
import { getAuthorizationToken } from '@/utils/headers';

/**
 * Middleware that validates the user's access token and attaches the user to the request object
 */
export function validateUser(fastify: FastifyInstance) {
  const authProvider = createAuthProvider({
    db: fastify.db,
    betterAuthInstance: fastify.betterAuthInstance,
  });
  const getCurrentUserUseCase = new GetCurrentUserUseCase(
    fastify.userRepository,
    authProvider
  );

  return async (req: FastifyRequest & { user?: User }) => {
    const accessToken = getAuthorizationToken(req);

    if (accessToken) {
      const user = await getCurrentUserUseCase.execute({ accessToken });
      (req as any).user = user;
    }
  };
}
