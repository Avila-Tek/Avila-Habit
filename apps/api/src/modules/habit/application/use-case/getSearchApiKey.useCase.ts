import type { TSearchApiKeyResponse } from '@repo/schemas';
import { SearchProviderNotConfiguredError } from '../../domain/errors/search.errors';
import type {
  GetSearchApiKeyCommand,
  IGetSearchApiKeyUseCase,
} from '../ports/getSearchApiKey.port';
import type { IHabitSearchProvider } from '../ports/habitSearchProvider.port';

export class GetSearchApiKeyUseCase implements IGetSearchApiKeyUseCase {
  constructor(private readonly searchProvider: IHabitSearchProvider | null) {}

  execute(command: GetSearchApiKeyCommand): TSearchApiKeyResponse {
    if (!this.searchProvider) {
      throw new SearchProviderNotConfiguredError();
    }

    return this.searchProvider.generateSecuredApiKey(command.userId);
  }
}
