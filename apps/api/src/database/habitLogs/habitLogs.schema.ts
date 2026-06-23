import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { habits } from '../habits/habits.schema';
import { users } from '../user/user.schema';

export const habitLogs = pgTable(
  'HabitLog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    habitId: uuid('habitId')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    logDate: date('logDate', { mode: 'date' }).notNull(),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completedAt', { mode: 'date', withTimezone: true }),
    value: integer('value').notNull().default(1),
    createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('habit_logs_user_log_date_idx').on(table.userId, table.logDate),
    unique('habit_logs_user_habit_log_date_unique').on(
      table.userId,
      table.habitId,
      table.logDate
    ),
  ]
);
