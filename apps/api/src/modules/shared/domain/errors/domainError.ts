export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'DOMAIN_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'EXTERNAL_SERVICE_ERROR';

export interface DomainErrorData {
  type: ErrorType;
  code: string;
  status: number;
  title: { es: string; en: string };
  message: { es: string; en: string };
}

export abstract class DomainError extends Error {
  abstract readonly type: ErrorType;
  abstract readonly code: string;
  abstract readonly status: number;
  abstract readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): DomainErrorData {
    return {
      type: this.type,
      code: this.code,
      status: this.status,
      title: this.i18n.title,
      message: this.i18n.message,
    };
  }
}
