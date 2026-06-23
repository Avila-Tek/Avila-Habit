import { toNodeHandler } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { envs } from '@/config';
import {
  type BetterAuthInstance,
  createBetterAuthInstance,
} from '@/modules/auth/infrastructure/providers/betterAuth';

declare module 'fastify' {
  interface FastifyInstance {
    betterAuthInstance?: BetterAuthInstance;
  }
}

function getCorsOrigin(requestOrigin: string | undefined): string | false {
  const allowedOrigins: string[] = JSON.parse(envs.cors.origins);
  if (allowedOrigins.includes('*')) {
    return requestOrigin || '*';
  }
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return false;
}

export default fp(
  async (fastify: FastifyInstance) => {
    // Only mount if using better-auth provider
    if (envs.auth.provider !== 'better-auth') {
      return;
    }

    const betterAuthInstance = createBetterAuthInstance(fastify.db);

    // Share the instance with other modules
    fastify.decorate('betterAuthInstance', betterAuthInstance);

    const handler = toNodeHandler(betterAuthInstance);

    // Mount Better Auth handler for OAuth callbacks at /api/auth/*
    fastify.all('/api/auth/*', async (request, reply) => {
      const origin = request.headers.origin;
      const allowedOrigin = getCorsOrigin(origin);

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        reply
          .header('Access-Control-Allow-Origin', allowedOrigin || '')
          .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          .header('Access-Control-Allow-Credentials', 'true')
          .status(204)
          .send();
        return;
      }

      // Add CORS headers to raw response before hijacking
      if (allowedOrigin) {
        reply.raw.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      reply.hijack();
      await handler(request.raw, reply.raw);
    });
  },
  { name: 'better-auth-handler', dependencies: ['database'] }
);
