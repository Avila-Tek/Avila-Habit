import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

export class UserNotFoundError extends DomainError {
  readonly type: ErrorType = 'NOT_FOUND_ERROR';
  readonly code = 'USER_NOT_FOUND';
  readonly status = 404;
  readonly i18n = {
    title: { es: 'Usuario no encontrado', en: 'User not found' },
    message: {
      es: 'El usuario no fue encontrado',
      en: 'User could not be found',
    },
  };

  constructor(identifier?: string) {
    super(identifier ? `User not found: ${identifier}` : 'User not found');
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly type: ErrorType = 'CONFLICT_ERROR';
  readonly code = 'USER_ALREADY_EXISTS';
  readonly status = 409;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.i18n = {
      title: { es: 'El usuario ya existe', en: 'User already exists' },
      message: {
        es: `El usuario con email ${email} ya existe`,
        en: `User with email ${email} already exists`,
      },
    };
  }
}

export class InvalidUserDataError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_USER_DATA';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(detail: string) {
    super(`Invalid user data: ${detail}`);
    this.i18n = {
      title: { es: 'Datos de usuario inválidos', en: 'Invalid user data' },
      message: {
        es: `Los datos de usuario son inválidos: ${detail}`,
        en: `User data is invalid: ${detail}`,
      },
    };
  }
}
