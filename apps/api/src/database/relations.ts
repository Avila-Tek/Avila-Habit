import { relations } from 'drizzle-orm';
import { accounts, sessions } from './auth/betterAuth.schema';
import { habitLogs } from './habitLogs/habitLogs.schema';
import { habits } from './habits/habits.schema';
import { posts } from './post/post.schema';
import { permissions, rolePermissions, roles } from './roles/roles.schema';
import { users } from './user/user.schema';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  sessions: many(sessions),
  accounts: many(accounts),
  habits: many(habits),
  habitLogs: many(habitLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  user: one(users, {
    fields: [habitLogs.userId],
    references: [users.id],
  }),
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));

// Roles and Permissions Relations
export const usersRoleRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
