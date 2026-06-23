import type { Role } from '@/modules/auth/domain/entities/RoleEntity';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByCode(code: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  findAllActive(): Promise<Role[]>;
}
