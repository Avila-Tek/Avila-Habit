import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

export class PaymentProviderNotFoundError extends DomainError {
  readonly type: ErrorType = 'NOT_FOUND_ERROR';
  readonly code = 'PAYMENT_PROVIDER_NOT_FOUND';
  readonly status = 404;
  readonly i18n = {
    title: { es: 'Proveedor no encontrado', en: 'Provider not found' },
    message: {
      es: 'El proveedor de pagos solicitado no existe',
      en: 'The requested payment provider does not exist',
    },
  };

  constructor(providerName: string) {
    super(`Payment provider not found: ${providerName}`);
  }
}

export class InvalidProviderNameError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_PROVIDER_NAME';
  readonly status = 400;
  readonly i18n = {
    title: { es: 'Proveedor inválido', en: 'Invalid provider' },
    message: {
      es: 'El nombre del proveedor de pagos no es válido',
      en: 'The payment provider name is not valid',
    },
  };

  constructor(providerName: string, validProviders: string[]) {
    super(
      `Invalid payment provider: ${providerName}. Valid values: ${validProviders.join(', ')}`
    );
  }
}

export class InvalidBillingIdentityIdError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'INVALID_BILLING_IDENTITY_ID';
  readonly status = 400;
  readonly i18n = {
    title: {
      es: 'ID de facturación inválido',
      en: 'Invalid billing identity ID',
    },
    message: {
      es: 'El identificador de facturación no puede estar vacío',
      en: 'Billing identity ID cannot be empty',
    },
  };

  constructor() {
    super('BillingIdentityId cannot be empty');
  }
}

export class StripeCheckoutUrlMissingError extends DomainError {
  readonly type: ErrorType = 'EXTERNAL_SERVICE_ERROR';
  readonly code = 'STRIPE_CHECKOUT_URL_MISSING';
  readonly status = 502;
  readonly i18n = {
    title: { es: 'Error de Stripe', en: 'Stripe error' },
    message: {
      es: 'No se pudo obtener la URL de checkout de Stripe',
      en: 'Could not get Stripe checkout URL',
    },
  };

  constructor() {
    super('Stripe checkout session URL is missing');
  }
}

export class MissingStripeSignatureError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'MISSING_STRIPE_SIGNATURE';
  readonly status = 400;
  readonly i18n = {
    title: { es: 'Firma faltante', en: 'Missing signature' },
    message: {
      es: 'Falta el encabezado de firma de Stripe',
      en: 'Missing stripe-signature header',
    },
  };

  constructor() {
    super('Missing stripe-signature header');
  }
}

export class EmptyStripeSignatureError extends DomainError {
  readonly type: ErrorType = 'VALIDATION_ERROR';
  readonly code = 'EMPTY_STRIPE_SIGNATURE';
  readonly status = 400;
  readonly i18n = {
    title: { es: 'Firma vacía', en: 'Empty signature' },
    message: {
      es: 'El encabezado de firma de Stripe está vacío',
      en: 'Stripe signature header is empty',
    },
  };

  constructor() {
    super('Empty stripe-signature header array');
  }
}
