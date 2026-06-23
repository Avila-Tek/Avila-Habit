import type { User } from '@/modules/user/domain/entities/user.entity';

export interface FindUsersQuery {
  page: number;
  limit: number;
}

export interface FindUsersResult {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IFindUsersUseCase {
  execute(query: FindUsersQuery): Promise<FindUsersResult>;
}
