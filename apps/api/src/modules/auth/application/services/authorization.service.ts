import type { IRoleRepository } from '@/modules/auth/application/ports/roleRepository.port';
import type { IUserRepository } from '@/modules/user/application/ports/userRepository.port';

export interface CheckPermissionInput {
  userId: string;
  permissionCode: string;
}

export interface IAuthorizationService {
  hasPermission(input: CheckPermissionInput): Promise<boolean>;
  requirePermission(input: CheckPermissionInput): Promise<void>;
}

export class AuthorizationService implements IAuthorizationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async hasPermission(input: CheckPermissionInput): Promise<boolean> {
    const user = await this.userRepository.findOne({ id: input.userId });
    if (!user) {
      return false;
    }

    // If user has no role, deny access
    if (!user.roleId) {
      return false;
    }

    const role = await this.roleRepository.findById(user.roleId);
    if (!role || !role.isActive) {
      return false;
    }

    return role.hasPermission(input.permissionCode);
  }

  async requirePermission(input: CheckPermissionInput): Promise<void> {
    const hasPermission = await this.hasPermission(input);
    if (!hasPermission) {
      throw new Error('403-insufficient-permissions');
    }
  }
}
