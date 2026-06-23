import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user/user.schema';

export const sessions = pgTable('Session', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const accounts = pgTable('Account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    mode: 'date',
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    mode: 'date',
    withTimezone: true,
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verifications = pgTable('Verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
