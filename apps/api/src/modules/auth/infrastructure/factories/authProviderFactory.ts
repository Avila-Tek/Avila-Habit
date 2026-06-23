import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { envs } from '@/config';
import type * as schema from '@/database';
import type { IAuthProvider } from '@/modules/auth/application/ports/authProvider.port';
import {
  type BetterAuthInstance,
  BetterAuthProvider,
  createBetterAuthInstance,
} from '../providers/betterAuth';
import { SupabaseAuthProvider } from '../providers/supabase';

export type AuthProviderType = 'supabase' | 'better-auth';

export interface AuthProviderFactoryDeps {
  db: NodePgDatabase<typeof schema>;
  betterAuthInstance?: BetterAuthInstance;
}

export function createAuthProvider(
  deps: AuthProviderFactoryDeps
): IAuthProvider {
  const providerType = envs.auth.provider;

  switch (providerType) {
    case 'better-auth': {
      // Use shared instance if available, otherwise create new one
      const instance =
        deps.betterAuthInstance ?? createBetterAuthInstance(deps.db);
      return new BetterAuthProvider(instance);
    }
    case 'supabase':
    default: {
      if (!envs.supabase.url || !envs.supabase.anonKey) {
        throw new Error(
          'SUPABASE_URL and SUPABASE_ANON_KEY are required when using Supabase auth'
        );
      }
      return new SupabaseAuthProvider(envs.supabase.url, envs.supabase.anonKey);
    }
  }
}
