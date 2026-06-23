import { InvalidTokenError } from '@/modules/auth/domain/errors/auth.errors';
import { FastifyRequest } from 'fastify';

export function getAuthorizationToken(request: FastifyRequest): string {
  const { headers } = request;
  const authorization = headers.authorization;

  if (!authorization) throw new InvalidTokenError();

  const authorizationIsArray = Array.isArray(authorization);
  const rawToken = authorizationIsArray ? authorization?.[0] : authorization;
  if (!rawToken) throw new InvalidTokenError();

  const token = rawToken.split(' ')?.[1];
  return token;
}
