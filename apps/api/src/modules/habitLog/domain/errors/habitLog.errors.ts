import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

export class HabitLogNotFoundError extends DomainError {
  readonly type: ErrorType = 'NOT_FOUND_ERROR';
  readonly code = 'HABIT_LOG_NOT_FOUND';
  readonly status = 404;
  readonly i18n = {
    title: { es: 'Registro no encontrado', en: 'Habit log not found' },
    message: {
      es: 'El registro de hábito solicitado no fue encontrado',
      en: 'The requested habit log was not found',
    },
  };

  constructor(identifier?: string) {
    super(
      identifier ? `Habit log not found: ${identifier}` : 'Habit log not found'
    );
  }
}

export class ValueExceedsTargetError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'VALUE_EXCEEDS_TARGET';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(value: number, target: number) {
    super(`Value ${value} exceeds target ${target}`);
    this.i18n = {
      title: {
        es: 'Valor excede el objetivo',
        en: 'Value exceeds target',
      },
      message: {
        es: `El valor ${value} excede el objetivo máximo de ${target}`,
        en: `Value ${value} exceeds the maximum target of ${target}`,
      },
    };
  }
}

export class HabitNotLoggableError extends DomainError {
  readonly type: ErrorType = 'AUTHORIZATION_ERROR';
  readonly code = 'HABIT_NOT_LOGGABLE';
  readonly status = 403;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(reason: 'paused' | 'blocked' | 'deleted') {
    const messages = {
      paused: {
        es: 'No se puede registrar un hábito pausado',
        en: 'Cannot log a paused habit',
      },
      blocked: {
        es: 'No se puede registrar un hábito bloqueado',
        en: 'Cannot log a blocked habit',
      },
      deleted: {
        es: 'No se puede registrar un hábito eliminado',
        en: 'Cannot log a deleted habit',
      },
    };

    super(messages[reason].en);
    this.i18n = {
      title: {
        es: 'Hábito no registrable',
        en: 'Habit not loggable',
      },
      message: messages[reason],
    };
  }
}

export class InvalidHabitLogDataError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_HABIT_LOG_DATA';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(detail: string) {
    super(`Invalid habit log data: ${detail}`);
    this.i18n = {
      title: {
        es: 'Datos de registro inválidos',
        en: 'Invalid habit log data',
      },
      message: {
        es: `Los datos del registro son inválidos: ${detail}`,
        en: `Habit log data is invalid: ${detail}`,
      },
    };
  }
}
