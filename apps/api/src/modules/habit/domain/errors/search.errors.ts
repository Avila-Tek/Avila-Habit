import {
  DomainError,
  type ErrorType,
} from '@/modules/shared/domain/errors/domainError';

export class SearchIndexError extends DomainError {
  readonly type: ErrorType = 'EXTERNAL_SERVICE_ERROR';
  readonly code = 'SEARCH_INDEX_ERROR';
  readonly status = 500;
  readonly i18n = {
    title: { es: 'Error de indexación', en: 'Index error' },
    message: {
      es: 'Error al indexar el hábito en el buscador',
      en: 'Error indexing habit in search engine',
    },
  };

  constructor(detail?: string) {
    super(detail ? `Search index error: ${detail}` : 'Search index error');
  }
}

export class SearchProviderNotConfiguredError extends DomainError {
  readonly type: ErrorType = 'EXTERNAL_SERVICE_ERROR';
  readonly code = 'SEARCH_PROVIDER_NOT_CONFIGURED';
  readonly status = 503;
  readonly i18n = {
    title: {
      es: 'Proveedor de búsqueda no configurado',
      en: 'Search provider not configured',
    },
    message: {
      es: 'El servicio de búsqueda no está configurado',
      en: 'Search service is not configured',
    },
  };

  constructor() {
    super('Search provider is not configured');
  }
}
