import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { planPrices, plans } from '../plan/plan.schema';
import { users } from '../user/user.schema';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: uuid('planId')
      .notNull()
      .references(() => plans.id),
    planPriceId: uuid('planPriceId')
      .notNull()
      .references(() => planPrices.id),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    stripeSubscriptionId: varchar('stripeSubscriptionId', { length: 255 }),
    stripeCustomerId: varchar('stripeCustomerId', { length: 255 }),
    currentPeriodStart: timestamp('currentPeriodStart', {
      mode: 'date',
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp('currentPeriodEnd', {
      mode: 'date',
      withTimezone: true,
    }),
    cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false),
    canceledAt: timestamp('canceledAt', { mode: 'date', withTimezone: true }),
    createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('subscriptions_userId_idx').on(table.userId),
    index('subscriptions_stripeSubscriptionId_idx').on(
      table.stripeSubscriptionId
    ),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  planPrice: one(planPrices, {
    fields: [subscriptions.planPriceId],
    references: [planPrices.id],
  }),
}));
