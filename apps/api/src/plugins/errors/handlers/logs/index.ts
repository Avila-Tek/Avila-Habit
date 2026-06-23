import type { IncomingHttpHeaders } from 'http';
import { Logger } from '@/utils/logger';

interface LogErrorInput {
  title: string;
  status: number;
  message: string;
  type: string;
  date: Date;
  stack: string[];
  body: unknown;
  query: unknown;
  headers: IncomingHttpHeaders;
  cause: {
    name: string;
    message: string;
    stack?: string[];
  } | null;
  url?: string;
  method?: string;
  userId?: string | null;
}

/**
 * Convert URL to request_method format for error logging
 */
function getRequestMethodFromUrl(method?: string, url?: string): string {
  if (!url || !method) return 'unknown_error';
  const path = url.split('?')[0] ?? '';
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? 'root';
  const action = lastSegment.replace(/-/g, '_');
  return `${method.toLowerCase()}_${action}`;
}

/**
 * Log error in supervisor's bracket format:
 * [level:ERROR][request_method:action][request_status:500][request_error:type] - Body: Message
 */
export function logError(record: LogErrorInput): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const ignoreStatus: number[] = [401, 403];

  // Build log context in supervisor's format
  // Si hay userId, el entityType es 'user' y entityId es el userId
  const logContext = {
    requestMethod: getRequestMethodFromUrl(record.method, record.url),
    requestStatus: record.status,
    requestError: record.type || 'unknown',
    entityType: record.userId ? 'user' : undefined,
    entityId: record.userId ?? undefined,
  };

  // Build detailed message
  const causeInfo = record.cause
    ? ` | Cause: ${record.cause.name}: ${record.cause.message}`
    : '';
  const detailedMessage = `${record.title} - ${record.message}${causeInfo}`;

  // Log based on status code severity
  if (record.status >= 500) {
    Logger.error(logContext, detailedMessage);
  } else if (record.status >= 400 && !ignoreStatus.includes(record.status)) {
    Logger.warn(logContext, detailedMessage);
  } else if (!ignoreStatus.includes(record.status)) {
    Logger.info(logContext, detailedMessage);
  }

  // Console output for development (detailed stack trace)
  if (!isProduction) {
    console.log(
      '\n------------------------------------------------------------'
    );
    console.log('Error:', record.title);
    console.log('Status:', record.status, '| Type:', record.type);
    console.log('Message:', record.message);
    if (record.cause) {
      console.log('Cause:', `${record.cause.name}: ${record.cause.message}`);
    }
    console.log('Stack:', record.stack.slice(0, 5).join('\n'));
    console.log(
      '------------------------------------------------------------\n'
    );
  }
}
