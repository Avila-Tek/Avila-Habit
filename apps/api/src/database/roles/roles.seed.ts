import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { permissions, rolePermissions, roles } from '@/database';

/**
 * Initial permissions for the system
 * Format: resource:action or resource:action:scope
 */
const initialPermissions = [
  // User permissions
  {
    code: 'user:create',
    name: 'Create User',
    description: 'Create regular users',
  },
  {
    code: 'user:read:own',
    name: 'Read Own User',
    description: 'Read own user data',
  },
  {
    code: 'user:update:own',
    name: 'Update Own User',
    description: 'Update own user data',
  },
  {
    code: 'user:delete:own',
    name: 'Delete Own User',
    description: 'Delete own user account',
  },

  // Admin user permissions
  {
    code: 'user:read:any',
    name: 'Read Any User',
    description: 'Read any user data',
  },
  {
    code: 'user:update:any',
    name: 'Update Any User',
    description: 'Update any user data',
  },
  {
    code: 'user:delete:any',
    name: 'Delete Any User',
    description: 'Delete any user account',
  },
  {
    code: 'user:admin:create',
    name: 'Create Admin User',
    description: 'Create admin users',
  },

  // Habit permissions
  { code: 'habit:create', name: 'Create Habit', description: 'Create habits' },
  {
    code: 'habit:read:own',
    name: 'Read Own Habits',
    description: 'Read own habits',
  },
  {
    code: 'habit:update:own',
    name: 'Update Own Habit',
    description: 'Update own habits',
  },
  {
    code: 'habit:delete:own',
    name: 'Delete Own Habit',
    description: 'Delete own habits',
  },
  {
    code: 'habit:read:any',
    name: 'Read Any Habit',
    description: 'Read any habit (admin)',
  },

  // Plan/Subscription permissions
  {
    code: 'plan:read',
    name: 'Read Plans',
    description: 'View available plans',
  },
  {
    code: 'plan:manage',
    name: 'Manage Plans',
    description: 'Create, update, delete plans',
  },
  {
    code: 'subscription:manage',
    name: 'Manage Subscriptions',
    description: 'Manage user subscriptions',
  },

  // Admin panel access
  {
    code: 'admin:access',
    name: 'Access Admin Panel',
    description: 'Access backoffice/admin panel',
  },
  {
    code: 'admin:full',
    name: 'Full Admin Access',
    description: 'Full administrative access',
  },
];

/**
 * Role definitions with their permissions
 */
const roleDefinitions = [
  {
    code: 'USER',
    name: 'User',
    description: 'Regular application user',
    permissions: [
      'user:read:own',
      'user:update:own',
      'user:delete:own',
      'habit:create',
      'habit:read:own',
      'habit:update:own',
      'habit:delete:own',
      'plan:read',
    ],
  },
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'System administrator with full access',
    permissions: [
      'user:create',
      'user:read:any',
      'user:update:any',
      'user:delete:any',
      'user:admin:create',
      'habit:create',
      'habit:read:any',
      'habit:update:own',
      'habit:delete:own',
      'plan:read',
      'plan:manage',
      'subscription:manage',
      'admin:access',
      'admin:full',
    ],
  },
];

export async function seedRolesAndPermissions(
  db: NodePgDatabase<typeof schema>
): Promise<void> {
  console.log('🌱 Seeding roles and permissions...');

  // Create permissions
  const permissionMap = new Map<string, string>(); // code -> id

  for (const perm of initialPermissions) {
    // Check if permission already exists
    const existing = await db
      .select()
      .from(permissions)
      .where(eq(permissions.code, perm.code))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      permissionMap.set(perm.code, existing[0].id);
      console.log(`  ✓ Permission "${perm.code}" already exists`);
    } else {
      const result = await db
        .insert(permissions)
        .values({
          code: perm.code,
          name: perm.name,
          description: perm.description,
        })
        .returning({ id: permissions.id });

      const created = result[0];
      if (created) {
        permissionMap.set(perm.code, created.id);
        console.log(`  ✓ Created permission "${perm.code}"`);
      }
    }
  }

  // Create roles
  for (const roleDef of roleDefinitions) {
    // Check if role already exists
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.code, roleDef.code))
      .limit(1);

    let roleId: string;

    if (existing.length > 0 && existing[0]) {
      roleId = existing[0].id;
      console.log(`  ✓ Role "${roleDef.code}" already exists`);
    } else {
      const result = await db
        .insert(roles)
        .values({
          code: roleDef.code,
          name: roleDef.name,
          description: roleDef.description,
          isActive: true,
        })
        .returning({ id: roles.id });

      const created = result[0];
      if (!created) {
        console.error(`  ✗ Failed to create role "${roleDef.code}"`);
        continue;
      }

      roleId = created.id;
      console.log(`  ✓ Created role "${roleDef.code}"`);
    }

    // Assign permissions to role
    for (const permCode of roleDef.permissions) {
      const permId = permissionMap.get(permCode);
      if (!permId) {
        console.warn(
          `  ⚠ Permission "${permCode}" not found for role "${roleDef.code}"`
        );
        continue;
      }

      // Check if relation already exists
      const existingRelation = await db
        .select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permId)
          )
        )
        .limit(1);

      if (existingRelation.length === 0) {
        await db.insert(rolePermissions).values({
          roleId,
          permissionId: permId,
        });
        console.log(`  ✓ Assigned "${permCode}" to "${roleDef.code}"`);
      }
    }
  }

  console.log('✅ Roles and permissions seeded successfully');
}
