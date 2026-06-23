import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins/bearer';
import { emailOTP } from 'better-auth/plugins/email-otp';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { envs } from '@/config';
import * as schema from '@/database';
import { sendVerificationOTP } from '@/plugins/integrations/email/connections/auth';

function buildSocialProviders() {
  const providers: Record<string, { clientId: string; clientSecret: string }> =
    {};

  if (envs.google.clientId && envs.google.clientSecret) {
    providers.google = {
      clientId: envs.google.clientId,
      clientSecret: envs.google.clientSecret,
    };
  }

  return providers;
}

export function createBetterAuthInstance(db: NodePgDatabase<typeof schema>) {
  if (!envs.betterAuth.secret) {
    throw new Error('BETTER_AUTH_SECRET is required when using Better Auth');
  }

  const socialProviders = buildSocialProviders();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: envs.betterAuth.secret,
    baseURL: envs.betterAuth.baseUrl,
    advanced: {
      database: {
        generateId: () => randomUUID(),
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      autoSignInAfterVerification: true,
    },
    socialProviders:
      Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
    plugins: [
      bearer(),
      emailOTP({
        otpLength: 6,
        expiresIn: 600, // 10 minutes
        sendVerificationOTP: async ({ email, otp, type }) => {
          await sendVerificationOTP({ email, otp, type });
        },
      }),
    ],
  });
}

export type BetterAuthInstance = ReturnType<typeof createBetterAuthInstance>;
