import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Logger } from '@/utils/logger';

declare module 'fastify' {
  interface FastifyRequest {
    startTime: number;
  }
}

/**
 * Convert URL path to request_method format
 * e.g., /api/v1/auth/current-user -> get_current_user
 */
function getRequestMethod(method: string, url: string): string {
  // Remove query params and get path
  const path = url.split('?')[0] ?? '';
  // Get last meaningful segment
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? 'root';
  // Convert to snake_case and prepend HTTP method
  const action = lastSegment.replace(/-/g, '_');
  return `${method.toLowerCase()}_${action}`;
}

/**
 * Map HTTP status to error type
 */
function getErrorType(statusCode: number): string {
  if (statusCode < 400) return 'none';
  if (statusCode === 400) return 'bad_request';
  if (statusCode === 401) return 'unauthorized';
  if (statusCode === 403) return 'forbidden';
  if (statusCode === 404) return 'not_found';
  if (statusCode === 409) return 'conflict';
  if (statusCode === 422) return 'validation_error';
  if (statusCode === 429) return 'rate_limited';
  if (statusCode >= 500) return 'internal_error';
  return 'client_error';
}

/**
 * Request Logger Plugin
 * Logs requests in supervisor's format:
 * [level:INFO][request_method:get_current_user][request_status:200][request_error:none] - Body: Message
 */
async function requestLoggerPlugin(fastify: FastifyInstance): Promise<void> {
  // Initialize the Logger with Fastify's logger instance
  Logger.init(fastify.log);

  // Mark request start time
  fastify.addHook('onRequest', async (request) => {
    request.startTime = Date.now();
  });

  // Log completed requests
  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = Date.now() - request.startTime;
    const userId = (request as any).user?.id?.value ?? null;

    // Skip health check endpoints to reduce noise
    if (request.url === '/health' || request.url === '/') {
      return;
    }

    const requestMethod = getRequestMethod(request.method, request.url);
    const errorType = getErrorType(reply.statusCode);

    // Si hay userId, incluir entity_type:user con entity_id
    const logContext = {
      requestMethod,
      requestStatus: reply.statusCode,
      requestError: errorType,
      entityType: userId ? 'user' : undefined,
      entityId: userId ?? undefined,
      requestClient: request.headers['user-agent']?.split('/')[0] ?? 'unknown',
    };

    const message = `${request.method} ${request.url} completed in ${responseTime}ms`;

    // Log based on status code
    if (reply.statusCode >= 500) {
      Logger.error(logContext, message);
    } else if (reply.statusCode >= 400) {
      Logger.warn(logContext, message);
    } else {
      Logger.info(logContext, message);
    }
  });
}

export default fp(requestLoggerPlugin, {
  name: 'request-logger',
});
