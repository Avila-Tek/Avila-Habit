import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { roles } from '../roles/roles.schema';

export const userStatusEnum = pgEnum('user_status', ['Active', 'Disabled']);

export const users = pgTable('User', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'), // Required by Better Auth internally
  firstName: text('first_name'),
  lastName: text('last_name'),
  image: text('image'),
  emailVerified: boolean('email_verified').notNull().default(false),
  timezone: text('timezone').notNull().default('America/New_York'),
  status: userStatusEnum('status').notNull().default('Active'),
  roleId: uuid('role_id').references(() => roles.id),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
