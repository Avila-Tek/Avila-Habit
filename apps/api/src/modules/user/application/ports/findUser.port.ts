import type { User } from '@/modules/user/domain/entities/user.entity';

export interface FindUserQuery {
  id?: string;
  email?: string;
}

export interface IFindUserUseCase {
  execute(query: FindUserQuery): Promise<User>;
}
