import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { permissions, rolePermissions, roles } from '@/database';
import type { IRoleRepository } from '@/modules/auth/application/ports/roleRepository.port';
import { Permission } from '@/modules/auth/domain/entities/PermissionEntity';
import { Role } from '@/modules/auth/domain/entities/RoleEntity';
import { PermissionCode } from '@/modules/auth/domain/value-objects/PermissionCode';

export class RolePostgresRepository implements IRoleRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  private async loadPermissions(roleId: string): Promise<Permission[]> {
    const rows = await this.db
      .select({
        id: permissions.id,
        code: permissions.code,
        name: permissions.name,
        description: permissions.description,
        createdAt: permissions.createdAt,
        updatedAt: permissions.updatedAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return rows.map((row) =>
      Permission.reconstitute({
        id: row.id,
        code: PermissionCode.create(row.code),
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  private async toDomain(
    raw: typeof roles.$inferSelect,
    loadPermissions = true
  ): Promise<Role> {
    const permissions = loadPermissions
      ? await this.loadPermissions(raw.id)
      : [];

    return Role.reconstitute({
      id: raw.id,
      code: raw.code,
      name: raw.name,
      description: raw.description,
      permissions,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<Role | null> {
    const [row] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    return row ? await this.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<Role | null> {
    const [row] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.code, code.toUpperCase()))
      .limit(1);

    return row ? await this.toDomain(row) : null;
  }

  async findAll(): Promise<Role[]> {
    const rows = await this.db.select().from(roles);
    return Promise.all(rows.map((row) => this.toDomain(row, false)));
  }

  async findAllActive(): Promise<Role[]> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(eq(roles.isActive, true));
    return Promise.all(rows.map((row) => this.toDomain(row, false)));
  }
}
