import type { FastifyBaseLogger } from 'fastify';

export type LogLevel = 'info' | 'debug' | 'warning' | 'error' | 'fatal';

/**
 * Log context following the supervisor's format:
 * [level:INFO][request_method:action][request_status:200][request_error:none][entity_type:X][entity_id:Y] - Body: Message
 */
export interface LogContext {
  /** The action/method being performed (e.g., get_current_user, create_subscription) */
  requestMethod: string;
  /** HTTP status code or operation result code */
  requestStatus: number;
  /** Error type categorized (e.g., not_found, unauthorized, validation_error) or 'none' for success */
  requestError: string;
  /**
   * Type of entity involved (e.g., user, subscription, plan, webhook, payment, invoice)
   * IMPORTANTE: Si se incluye entityType, DEBE incluirse entityId
   */
  entityType?: string;
  /**
   * ID de la entidad - OBLIGATORIO si hay entityType
   * Ejemplos: userId, subscriptionId, stripeEventId, paymentId, etc.
   */
  entityId?: string;
  /** Optional: Client/source of request */
  requestClient?: string;
}

/**
 * Logger utility that outputs in the supervisor's bracket format:
 * [level:INFO][request_method:action][request_status:200][request_error:none] - Body: Message
 *
 * Sends to Loki in production via Pino transport
 */
export class Logger {
  private static instance: FastifyBaseLogger | null = null;

  static init(logger: FastifyBaseLogger): void {
    Logger.instance = logger;
  }

  private static getLogger(): FastifyBaseLogger {
    if (!Logger.instance) {
      return {
        info: console.info.bind(console),
        debug: console.debug.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        fatal: console.error.bind(console),
        trace: console.trace.bind(console),
        child: () => Logger.getLogger(),
        level: 'info',
        silent: () => {},
      } as unknown as FastifyBaseLogger;
    }
    return Logger.instance;
  }

  /**
   * Format log message with bracket tags
   * Output: [level:INFO][request_method:action][request_status:200][request_error:none] - Body: Message
   */
  private static formatMessage(
    level: LogLevel,
    context: LogContext,
    message: string
  ): string {
    const tags: string[] = [
      `[level:${level.toUpperCase()}]`,
      `[request_method:${context.requestMethod}]`,
      `[request_status:${context.requestStatus}]`,
      `[request_error:${context.requestError}]`,
    ];

    if (context.entityType) {
      tags.push(`[entity_type:${context.entityType}]`);
    }

    if (context.entityId) {
      tags.push(`[entity_id:${context.entityId}]`);
    }

    if (context.requestClient) {
      tags.push(`[request_client:${context.requestClient}]`);
    }

    return `${tags.join('')} - Body: Message: ${message}`;
  }

  /**
   * Log informational messages (successful operations, business events)
   */
  static info(context: LogContext, message: string): void {
    const logger = Logger.getLogger();
    const formattedMessage = Logger.formatMessage('info', context, message);
    logger.info(formattedMessage);
  }

  /**
   * Log debug information (detailed diagnostic info)
   */
  static debug(context: LogContext, message: string): void {
    const logger = Logger.getLogger();
    const formattedMessage = Logger.formatMessage('debug', context, message);
    logger.debug(formattedMessage);
  }

  /**
   * Log warnings (potential issues, deprecated usage)
   */
  static warn(context: LogContext, message: string): void {
    const logger = Logger.getLogger();
    const formattedMessage = Logger.formatMessage('warning', context, message);
    logger.warn(formattedMessage);
  }

  /**
   * Log errors (failures that need attention)
   */
  static error(context: LogContext, message: string): void {
    const logger = Logger.getLogger();
    const formattedMessage = Logger.formatMessage('error', context, message);
    logger.error(formattedMessage);
  }

  /**
   * Log fatal errors (critical failures)
   */
  static fatal(context: LogContext, message: string): void {
    const logger = Logger.getLogger();
    const formattedMessage = Logger.formatMessage('fatal', context, message);
    logger.fatal(formattedMessage);
  }

  /**
   * Create a child logger with preset context
   */
  static child(context: Record<string, unknown>): FastifyBaseLogger {
    return Logger.getLogger().child(context);
  }
}
