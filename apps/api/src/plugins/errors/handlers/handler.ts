import type { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '@/modules/shared/domain/errors/domainError';
import { errorRegistry } from './dictionaries';
import { Exception } from './exception';
import { languageNegotiation } from './language';
import { logError } from './logs';
import { generateCleanStackTrace } from './stack';

function injectParams(detail: string, params: Record<string, any>) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`<${key}>`, value);
  }, detail);
}

const productionEnv = process.env.APP_ENV === 'production';

function extractCause(error: Error | Exception) {
  const cause =
    error instanceof Error && error.cause instanceof Error ? error.cause : null;
  if (!cause) return null;

  return {
    name: cause.name,
    message: cause.message,
    stack: cause.stack?.split('\n').map((line) => line.trim()),
  };
}

export function handleError(
  error: Error | Exception,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log('Error detected');
  const date = new Date();
  const language = languageNegotiation(request);
  const cause = extractCause(error);
  const stack = generateCleanStackTrace(error);
  if (cause?.message) {
    stack.unshift(`Cause: ${cause.name ?? 'Error'} - ${cause.message}`);
  }

  // Handle DomainError (new hexagonal architecture)
  if (error instanceof DomainError) {
    const errorData = error.toJSON();
    const errorTitle = errorData.title[language];
    const errorMessage = errorData.message[language];

    logError({
      title: errorTitle,
      status: errorData.status,
      message: errorMessage,
      type: errorData.type,
      stack,
      date,
      body: request?.body,
      query: request?.query,
      headers: request?.headers,
      cause,
      url: request?.url,
      method: request?.method,
      userId: (request as any)?.user?.id?.value ?? null,
    });

    reply.status(errorData.status).send({
      title: errorTitle,
      message: errorMessage,
      status: errorData.status,
      type: errorData.type,
      code: errorData.code,
    });
    return;
  }

  // TODO: HTTP Error handler
  // TODO: Common error handlers

  let title = 'Unhandled server error';
  let status = 500;
  let message = 'An unexpected error appeared';
  let type = 'default';
  let silent = false;

  if (error instanceof Exception) {
    silent = error.silent && productionEnv;
    const data = error.data;
    title = error.data.title[language];
    status = error.data.status;
    type = error.data.type;
    message = injectParams(data.message[language], error.params);
  }

  logError({
    title,
    status,
    message,
    type,
    stack,
    date,
    body: request?.body,
    query: request?.query,
    headers: request?.headers,
    cause,
    url: request?.url,
    method: request?.method,
    userId: (request as any)?.user?.id?.value ?? null,
  });

  const genericError = errorRegistry.getError('internal', 'default');
  const response = {
    title: silent ? genericError.title[language] : title,
    message: silent ? genericError.message[language] : message,
    status: silent ? genericError.status : status,
    stack: !productionEnv && status === 500 ? stack : undefined,
    cause: !productionEnv && status === 500 ? cause : undefined,
  };

  // Send error response
  reply.status(status).send(response);
}
