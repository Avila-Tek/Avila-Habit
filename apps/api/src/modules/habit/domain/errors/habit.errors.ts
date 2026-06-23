import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

export class HabitNotFoundError extends DomainError {
  readonly type: ErrorType = 'NOT_FOUND_ERROR';
  readonly code = 'HABIT_NOT_FOUND';
  readonly status = 404;
  readonly i18n = {
    title: { es: 'Hábito no encontrado', en: 'Habit not found' },
    message: {
      es: 'El hábito solicitado no fue encontrado',
      en: 'The requested habit was not found',
    },
  };

  constructor(identifier?: string) {
    super(identifier ? `Habit not found: ${identifier}` : 'Habit not found');
  }
}

export class InvalidHabitDataError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_HABIT_DATA';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(detail: string) {
    super(`Invalid habit data: ${detail}`);
    this.i18n = {
      title: { es: 'Datos de hábito inválidos', en: 'Invalid habit data' },
      message: {
        es: `Los datos del hábito son inválidos: ${detail}`,
        en: `Habit data is invalid: ${detail}`,
      },
    };
  }
}

export class HabitAlreadyPausedError extends DomainError {
  readonly type: ErrorType = 'CONFLICT_ERROR';
  readonly code = 'HABIT_ALREADY_PAUSED';
  readonly status = 409;
  readonly i18n = {
    title: { es: 'Hábito ya pausado', en: 'Habit already paused' },
    message: {
      es: 'El hábito ya se encuentra pausado',
      en: 'The habit is already paused',
    },
  };

  constructor() {
    super('Habit is already paused');
  }
}

export class HabitAlreadyActiveError extends DomainError {
  readonly type: ErrorType = 'CONFLICT_ERROR';
  readonly code = 'HABIT_ALREADY_ACTIVE';
  readonly status = 409;
  readonly i18n = {
    title: { es: 'Hábito ya activo', en: 'Habit already active' },
    message: {
      es: 'El hábito ya se encuentra activo',
      en: 'The habit is already active',
    },
  };

  constructor() {
    super('Habit is already active');
  }
}

export class HabitAlreadyBlockedError extends DomainError {
  readonly type: ErrorType = 'CONFLICT_ERROR';
  readonly code = 'HABIT_ALREADY_BLOCKED';
  readonly status = 409;
  readonly i18n = {
    title: { es: 'Hábito ya bloqueado', en: 'Habit already blocked' },
    message: {
      es: 'El hábito ya se encuentra bloqueado',
      en: 'The habit is already blocked',
    },
  };

  constructor() {
    super('Habit is already blocked');
  }
}

export class HabitBlockedError extends DomainError {
  readonly type: ErrorType = 'AUTHORIZATION_ERROR';
  readonly code = 'HABIT_BLOCKED';
  readonly status = 403;
  readonly i18n = {
    title: { es: 'Hábito bloqueado', en: 'Habit blocked' },
    message: {
      es: 'No se puede realizar la operación porque el hábito está bloqueado',
      en: 'Cannot perform operation because the habit is blocked',
    },
  };

  constructor() {
    super('Habit is blocked');
  }
}

export class HabitDeletedError extends DomainError {
  readonly type: ErrorType = 'NOT_FOUND_ERROR';
  readonly code = 'HABIT_DELETED';
  readonly status = 410;
  readonly i18n = {
    title: { es: 'Hábito eliminado', en: 'Habit deleted' },
    message: {
      es: 'El hábito ha sido eliminado',
      en: 'The habit has been deleted',
    },
  };

  constructor() {
    super('Habit has been deleted');
  }
}

export class InvalidScheduleError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_SCHEDULE';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(detail: string) {
    super(`Invalid schedule: ${detail}`);
    this.i18n = {
      title: { es: 'Programación inválida', en: 'Invalid schedule' },
      message: {
        es: `La programación es inválida: ${detail}`,
        en: `Schedule is invalid: ${detail}`,
      },
    };
  }
}

export class InvalidGoalError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_GOAL';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(detail: string) {
    super(`Invalid goal: ${detail}`);
    this.i18n = {
      title: { es: 'Meta inválida', en: 'Invalid goal' },
      message: {
        es: `La meta es inválida: ${detail}`,
        en: `Goal is invalid: ${detail}`,
      },
    };
  }
}

export class InvalidReminderError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_REMINDER';
  readonly status = 400;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(detail: string) {
    super(`Invalid reminder: ${detail}`);
    this.i18n = {
      title: { es: 'Recordatorio inválido', en: 'Invalid reminder' },
      message: {
        es: `El recordatorio es inválido: ${detail}`,
        en: `Reminder is invalid: ${detail}`,
      },
    };
  }
}

export class HabitLimitExceededError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'HABIT_LIMIT_EXCEEDED';
  readonly status = 403;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(current: number, limit: number) {
    super(`Habit limit exceeded: ${current}/${limit}`);
    this.i18n = {
      title: { es: 'Límite de hábitos alcanzado', en: 'Habit limit reached' },
      message: {
        es: `Has alcanzado el límite de ${limit} hábitos de tu plan. Actualmente tienes ${current} hábitos.`,
        en: `You have reached the limit of ${limit} habits for your plan. You currently have ${current} habits.`,
      },
    };
  }
}
