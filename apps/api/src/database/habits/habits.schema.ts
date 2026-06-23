import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../user/user.schema';

export const habitStatusEnum = pgEnum('habit_status', [
  'active',
  'paused',
  'blocked',
]);
export const scheduleTypeEnum = pgEnum('schedule_type', [
  'daily',
  'weekly',
  'custom',
]);
export const goalPeriodEnum = pgEnum('goal_period', ['day', 'week']);
export const timeOfDayEnum = pgEnum('time_of_day', [
  'morning',
  'afternoon',
  'evening',
]);

export const habits = pgTable('Habit', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  scheduleType: scheduleTypeEnum('scheduleType').notNull().default('daily'),
  scheduleDaysOfWeek: jsonb('scheduleDaysOfWeek').$type<number[]>(),
  scheduleWeeklyDay: integer('scheduleWeeklyDay'),
  scheduleWeeklyFlexible: boolean('scheduleWeeklyFlexible')
    .notNull()
    .default(false),
  goalUnit: text('goalUnit').notNull().default('times'),
  goalPeriod: goalPeriodEnum('goalPeriod').notNull().default('day'),
  goalTarget: integer('goalTarget').notNull().default(1),
  timeOfDay: timeOfDayEnum('timeOfDay').notNull().default('morning'),
  reminderEnabled: boolean('reminderEnabled').notNull().default(false),
  reminderTime: text('reminderTime'),
  status: habitStatusEnum('status').notNull().default('active'),
  isActive: boolean('isActive').notNull().default(true),
  startDate: timestamp('startDate', { mode: 'date', withTimezone: true }),
  endDate: timestamp('endDate', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
