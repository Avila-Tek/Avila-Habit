import type { Permission } from '@/modules/auth/domain/entities/PermissionEntity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByCode(code: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findByRoleId(roleId: string): Promise<Permission[]>;
}
