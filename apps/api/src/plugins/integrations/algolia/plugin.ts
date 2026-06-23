import { ALGOLIA_INDEX_NAMES } from '@repo/schemas';
import fp from 'fastify-plugin';
import { envs } from '@/config/envs';
import type { IHabitSearchProvider } from '@/modules/habit/application/ports/habitSearchProvider.port';
import { AlgoliaHabitSearchProvider } from '@/modules/habit/infrastructure/providers/algolia';

declare module 'fastify' {
  interface FastifyInstance {
    algolia: {
      habitSearch: IHabitSearchProvider | null;
    };
  }
}

export default fp(
  (fastify) => {
    let habitSearch: IHabitSearchProvider | null = null;

    if (envs.algolia.appId && envs.algolia.privateKey) {
      habitSearch = new AlgoliaHabitSearchProvider({
        appId: envs.algolia.appId,
        apiKey: envs.algolia.privateKey,
        indexName: ALGOLIA_INDEX_NAMES.HABITS,
      });
      fastify.log.info('Algolia habit search provider initialized');
    } else {
      fastify.log.warn(
        'Algolia credentials not configured, search will be disabled'
      );
    }

    fastify.decorate('algolia', {
      habitSearch,
    });
  },
  { name: 'algolia' }
);
