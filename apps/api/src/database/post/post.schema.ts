import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user/user.schema';

export const posts = pgTable('Post', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').notNull().default(false),
  authorId: uuid('authorId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deletedAt', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
