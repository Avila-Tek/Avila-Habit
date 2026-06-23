import type { User } from '@/modules/user/domain/entities/user.entity';

export interface CreateUserCommand {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  timezone?: string;
}

export interface ICreateUserUseCase {
  execute(command: CreateUserCommand): Promise<User>;
}
