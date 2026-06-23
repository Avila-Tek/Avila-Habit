import type { TSearchApiKeyResponse } from '@repo/schemas';

export interface GetSearchApiKeyCommand {
  userId: string;
}

export interface IGetSearchApiKeyUseCase {
  execute(command: GetSearchApiKeyCommand): TSearchApiKeyResponse;
}
