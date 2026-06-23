import type { User } from '@/modules/user/domain/entities/user.entity';

export interface AssignRoleCommand {
  userId: string;
  roleCode: 'USER' | 'ADMIN';
}

export interface IAssignRoleUseCase {
  execute(command: AssignRoleCommand): Promise<User>;
}
