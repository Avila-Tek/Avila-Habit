import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

const errors = {
  PLAN_NOT_FOUND: {
    type: 'NOT_FOUND_ERROR' as ErrorType,
    code: 'PLAN_NOT_FOUND',
    status: 404,
    i18n: {
      title: { es: 'Plan no encontrado', en: 'Plan not found' },
      message: {
        es: 'El plan solicitado no existe',
        en: 'The requested plan does not exist',
      },
    },
  },
  PLAN_PRICE_NOT_FOUND: {
    type: 'NOT_FOUND_ERROR' as ErrorType,
    code: 'PLAN_PRICE_NOT_FOUND',
    status: 404,
    i18n: {
      title: { es: 'Precio no encontrado', en: 'Price not found' },
      message: {
        es: 'El precio solicitado no existe',
        en: 'The requested price does not exist',
      },
    },
  },
  PLAN_ALREADY_EXISTS: {
    type: 'CONFLICT_ERROR' as ErrorType,
    code: 'PLAN_ALREADY_EXISTS',
    status: 409,
    i18n: {
      title: { es: 'Plan ya existe', en: 'Plan already exists' },
      message: {
        es: 'Ya existe un plan con esta clave',
        en: 'A plan with this key already exists',
      },
    },
  },
  PLAN_KEY_IMMUTABLE: {
    type: 'VALIDATION_ERROR' as ErrorType,
    code: 'PLAN_KEY_IMMUTABLE',
    status: 400,
    i18n: {
      title: { es: 'Clave inmutable', en: 'Immutable key' },
      message: {
        es: 'La clave del plan no puede ser modificada',
        en: 'Plan key cannot be updated',
      },
    },
  },
  PLAN_NOT_SYNCED: {
    type: 'DOMAIN_ERROR' as ErrorType,
    code: 'PLAN_NOT_SYNCED',
    status: 400,
    i18n: {
      title: { es: 'Plan no sincronizado', en: 'Plan not synced' },
      message: {
        es: 'El plan no está sincronizado con Stripe',
        en: 'The plan is not synced with Stripe',
      },
    },
  },
  STRIPE_NOT_CONFIGURED: {
    type: 'INTERNAL_SERVER_ERROR' as ErrorType,
    code: 'STRIPE_NOT_CONFIGURED',
    status: 500,
    i18n: {
      title: { es: 'Error de configuración', en: 'Configuration error' },
      message: {
        es: 'El proveedor de pagos no está configurado',
        en: 'Payment provider is not configured',
      },
    },
  },
} as const;

class PlanDomainError extends DomainError {
  readonly type: ErrorType;
  readonly code: string;
  readonly status: number;
  readonly i18n: {
    title: { es: string; en: string };
    message: { es: string; en: string };
  };

  constructor(key: keyof typeof errors, detail?: string) {
    const def = errors[key];
    super(detail ?? def.code);
    this.type = def.type;
    this.code = def.code;
    this.status = def.status;
    this.i18n = def.i18n;
  }
}

export const PlanError = {
  notFound: (planId: string) =>
    new PlanDomainError('PLAN_NOT_FOUND', `Plan with id "${planId}" not found`),
  priceNotFound: (priceId: string) =>
    new PlanDomainError(
      'PLAN_PRICE_NOT_FOUND',
      `PlanPrice with id "${priceId}" not found`
    ),
  alreadyExists: (key: string) =>
    new PlanDomainError(
      'PLAN_ALREADY_EXISTS',
      `Plan with key "${key}" already exists`
    ),
  keyImmutable: () => new PlanDomainError('PLAN_KEY_IMMUTABLE'),
  notSynced: (planId: string) =>
    new PlanDomainError(
      'PLAN_NOT_SYNCED',
      `Plan with id "${planId}" is not synced with Stripe`
    ),
  stripeNotConfigured: () => new PlanDomainError('STRIPE_NOT_CONFIGURED'),
};
