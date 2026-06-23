import type { User } from '@/modules/user/domain/entities/user.entity';

export interface UpdateUserCommand {
  id: string;
  email?: string;
  name?: string | null;
  timezone?: string;
  status?: 'Active' | 'Disabled';
}

export interface IUpdateUserUseCase {
  execute(command: UpdateUserCommand): Promise<User>;
}
