import type { AlgoliaIndexName } from '@repo/schemas';

export interface AlgoliaConfig {
  appId: string;
  apiKey: string;
  indexName: AlgoliaIndexName;
}
