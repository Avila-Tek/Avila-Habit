import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { permissions, rolePermissions } from '@/database';
import type { IPermissionRepository } from '@/modules/auth/application/ports/permissionRepository.port';
import { Permission } from '@/modules/auth/domain/entities/PermissionEntity';
import { PermissionCode } from '@/modules/auth/domain/value-objects/PermissionCode';

export class PermissionPostgresRepository implements IPermissionRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  private toDomain(raw: typeof permissions.$inferSelect): Permission {
    return Permission.reconstitute({
      id: raw.id,
      code: PermissionCode.create(raw.code),
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<Permission | null> {
    const [row] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    const [row] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.code, code.toLowerCase()))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Permission[]> {
    const rows = await this.db.select().from(permissions);
    return rows.map((row) => this.toDomain(row));
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
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
}
