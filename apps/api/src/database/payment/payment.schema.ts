import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { subscriptions } from '../subscription/subscription.schema';
import { users } from '../user/user.schema';

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscriptionId').references(() => subscriptions.id),
    amountCents: integer('amountCents').notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('usd'),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
    stripeInvoiceId: varchar('stripeInvoiceId', { length: 255 }),
    stripeCustomerId: varchar('stripeCustomerId', { length: 255 }),
    paidAt: timestamp('paidAt', { mode: 'date', withTimezone: true }),
    createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('payments_userId_idx').on(table.userId),
    index('payments_subscriptionId_idx').on(table.subscriptionId),
    index('payments_stripePaymentIntentId_idx').on(table.stripePaymentIntentId),
  ]
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));
