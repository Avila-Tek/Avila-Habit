import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

export class InvalidCredentialsError extends DomainError {
  readonly type: ErrorType = 'AUTHENTICATION_ERROR';
  readonly code = 'INVALID_CREDENTIALS';
  readonly status = 401;
  readonly i18n = {
    title: { es: 'Credenciales inválidas', en: 'Invalid credentials' },
    message: {
      es: 'Las credenciales ingresadas no son válidas',
      en: 'The submitted credentials are invalid',
    },
  };

  constructor() {
    super('Invalid credentials');
  }
}

export class InvalidTokenError extends DomainError {
  readonly type: ErrorType = 'AUTHENTICATION_ERROR';
  readonly code = 'INVALID_TOKEN';
  readonly status = 401;
  readonly i18n = {
    title: { es: 'Token inválido', en: 'Invalid token' },
    message: {
      es: 'El token no es válido',
      en: 'The token is invalid',
    },
  };

  constructor() {
    super('Invalid token');
  }
}

export class SecretMissingError extends DomainError {
  readonly type: ErrorType = 'INTERNAL_SERVER_ERROR';
  readonly code = 'SECRET_MISSING';
  readonly status = 500;
  readonly i18n = {
    title: { es: 'Error interno', en: 'Internal error' },
    message: {
      es: 'La llave secreta no fue encontrada',
      en: 'Secret key was not found',
    },
  };

  constructor() {
    super('Secret key is missing');
  }
}

export class PasswordMismatchError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'PASSWORD_MISMATCH';
  readonly status = 400;
  readonly i18n = {
    title: { es: 'Error de validación', en: 'Validation error' },
    message: {
      es: 'Las contraseñas no coinciden',
      en: 'Passwords do not match',
    },
  };

  constructor() {
    super('Passwords do not match');
  }
}

export class EmailNotConfirmedError extends DomainError {
  readonly type: ErrorType = 'AUTHENTICATION_ERROR';
  readonly code = 'EMAIL_NOT_CONFIRMED';
  readonly status = 401;
  readonly i18n = {
    title: { es: 'Email no confirmado', en: 'Email not confirmed' },
    message: {
      es: 'Debe confirmar su email antes de iniciar sesión',
      en: 'You must confirm your email before signing in',
    },
  };

  constructor() {
    super('Email not confirmed');
  }
}

export class SupabaseAuthError extends DomainError {
  readonly type: ErrorType = 'INTERNAL_SERVER_ERROR';
  readonly code = 'SUPABASE_AUTH_ERROR';
  readonly status = 500;
  readonly i18n = {
    title: { es: 'Error de autenticación', en: 'Authentication error' },
    message: {
      es: 'Error al comunicarse con el proveedor de autenticación',
      en: 'Error communicating with authentication provider',
    },
  };

  constructor(public readonly supabaseMessage?: string) {
    super(supabaseMessage ?? 'Supabase authentication error');
  }
}

export class UserDisabledError extends DomainError {
  readonly type: ErrorType = 'AUTHORIZATION_ERROR';
  readonly code = 'USER_DISABLED';
  readonly status = 403;
  readonly i18n = {
    title: { es: 'Usuario deshabilitado', en: 'User disabled' },
    message: {
      es: 'Su cuenta ha sido deshabilitada',
      en: 'Your account has been disabled',
    },
  };

  constructor() {
    super('User account is disabled');
  }
}

export class BetterAuthError extends DomainError {
  readonly type: ErrorType = 'INTERNAL_SERVER_ERROR';
  readonly code = 'BETTER_AUTH_ERROR';
  readonly status = 500;
  readonly i18n = {
    title: { es: 'Error de autenticacion', en: 'Authentication error' },
    message: {
      es: 'Error al comunicarse con el proveedor de autenticacion',
      en: 'Error communicating with authentication provider',
    },
  };

  constructor(public readonly betterAuthMessage?: string) {
    super(betterAuthMessage ?? 'Better Auth authentication error');
  }
}

export class InvalidOtpError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_OTP';
  readonly status = 400;
  readonly i18n = {
    title: { es: 'Codigo OTP invalido', en: 'Invalid OTP code' },
    message: {
      es: 'El codigo de verificacion ingresado no es valido o ha expirado',
      en: 'The verification code entered is invalid or has expired',
    },
  };

  constructor() {
    super('Invalid or expired OTP code');
  }
}
