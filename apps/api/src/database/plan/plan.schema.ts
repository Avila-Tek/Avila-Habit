import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const plans = pgTable(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    isActive: boolean('isActive').notNull().default(true),
    isFree: boolean('isFree').notNull().default(false),
    displayOrder: integer('displayOrder').notNull().default(0),
    limitsHabitsMax: integer('limitsHabitsMax'),
    limitsReportsEnabled: boolean('limitsReportsEnabled')
      .notNull()
      .default(true),
    limitsHistoryDays: integer('limitsHistoryDays'),
    limitsRemindersEnabled: boolean('limitsRemindersEnabled')
      .notNull()
      .default(true),
    stripeProductId: varchar('stripeProductId', { length: 255 }),
    createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('plans_displayOrder_idx').on(table.displayOrder)]
);

export const planPrices = pgTable(
  'planPrices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('planId')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    currency: varchar('currency', { length: 10 }).notNull().default('usd'),
    interval: varchar('interval', { length: 20 }).notNull(),
    amountCents: integer('amountCents').notNull(),
    trialDays: integer('trialDays').notNull().default(0),
    isActive: boolean('isActive').notNull().default(true),
    stripePriceId: varchar('stripePriceId', { length: 255 }),
    createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('planPrices_planId_isActive_idx').on(table.planId, table.isActive),
  ]
);

export const plansRelations = relations(plans, ({ many }) => ({
  prices: many(planPrices),
}));

export const planPricesRelations = relations(planPrices, ({ one }) => ({
  plan: one(plans, {
    fields: [planPrices.planId],
    references: [plans.id],
  }),
}));
