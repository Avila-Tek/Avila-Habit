import { z } from 'zod';

const enviromentVariablesSchema = z.object({
  /* Bare minimun */
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.transform((input) => parseInt(String(input), 10)).default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE: z.string(),
  JWT_SECRET: z.string(),
  /* Auth Provider Selection */
  AUTH_PROVIDER: z.enum(['supabase', 'better-auth']).default('supabase'),
  /* Supabase */
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  /* Better Auth */
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_BASE_URL: z.string().url().optional(),
  /* Google OAuth */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
  LOKI_APP_NAME: z.string().optional(),
  LOKI_HOST: z.string().optional(),
  LOKI_USERNAME: z.string().optional(),
  LOKI_PASSWORD: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),
  CORS_ORIGINS: z.string().default('["*"]'),

  SENTRY_DSN: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional().default('avilatek'),
  AWS_REGION: z.string().optional().default('sfo3'),
  AWS_ENDPOINT: z.string().optional().default('digitaloceanspaces.com'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  ALGOLIA_APP_ID: z.string().optional(),
  ALGOLIA_PRIVATE_KEY: z.string().optional(),
  POSTMARK_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

type TEnviromentVariables = z.infer<typeof enviromentVariablesSchema>;

const result = enviromentVariablesSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(
    `Config validation error: ${JSON.stringify(result.error.format(), null, 2)}`
  );
}

const envVars: TEnviromentVariables = result.data;

export const envs = {
  stage: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  database: envVars.DATABASE,
  sentry: {
    dsn: envVars.SENTRY_DSN,
  },
  aws: {
    bucketName: envVars.AWS_BUCKET_NAME,
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    endpoint: envVars.AWS_ENDPOINT,
  },
  algolia: {
    appId: envVars.ALGOLIA_APP_ID,
    privateKey: envVars.ALGOLIA_PRIVATE_KEY,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  auth: {
    provider: envVars.AUTH_PROVIDER,
  },
  supabase: {
    url: envVars.SUPABASE_URL,
    anonKey: envVars.SUPABASE_ANON_KEY,
  },
  betterAuth: {
    secret: envVars.BETTER_AUTH_SECRET,
    baseUrl: envVars.BETTER_AUTH_BASE_URL,
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },
  loki: {
    appName: envVars.LOKI_APP_NAME,
    host: envVars.LOKI_HOST,
    username: envVars.LOKI_USERNAME,
    password: envVars.LOKI_PASSWORD,
    level: envVars.LOG_LEVEL,
  },
  posthog: {
    apiKey: envVars.POSTHOG_API_KEY,
    host: envVars.POSTHOG_HOST,
  },
  cors: {
    origins: envVars.CORS_ORIGINS,
  },
  email: {
    postmark: envVars.POSTMARK_API_KEY,
  },
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  },
};
