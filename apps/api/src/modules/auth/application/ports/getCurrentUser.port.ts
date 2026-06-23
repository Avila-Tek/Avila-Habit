import type { User } from '@/modules/user/domain/entities/user.entity';

export interface GetCurrentUserQuery {
  accessToken: string;
}

export interface IGetCurrentUserUseCase {
  execute(query: GetCurrentUserQuery): Promise<User>;
}
