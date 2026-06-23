import type { IRoleRepository } from '@/modules/auth/application/ports/roleRepository.port';
import type { User } from '@/modules/user/domain/entities/user.entity';
import { UserNotFoundError } from '@/modules/user/domain/errors/user.errors';
import type {
  AssignRoleCommand,
  IAssignRoleUseCase,
} from '../ports/assignRole.port';
import type { IUserRepository } from '../ports/userRepository.port';

export class AssignRoleUseCase implements IAssignRoleUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(command: AssignRoleCommand): Promise<User> {
    // Verify user exists
    const user = await this.userRepository.findOne({ id: command.userId });
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    // Find role by code
    const role = await this.roleRepository.findByCode(command.roleCode);
    if (!role) {
      throw new Error(`Role ${command.roleCode} not found`);
    }

    if (!role.isActive) {
      throw new Error(`Role ${command.roleCode} is not active`);
    }

    // Update user with new role
    const updatedUser = await this.userRepository.update(command.userId, {
      roleId: role.id,
    });

    if (!updatedUser) {
      throw new UserNotFoundError(command.userId);
    }

    return updatedUser;
  }
}
