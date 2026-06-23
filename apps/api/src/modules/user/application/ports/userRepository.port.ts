import type { User } from '@/modules/user/domain/entities/user.entity';

export interface UserFindInput {
  id?: string;
  email?: string;
}

export interface CreateUserInput {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  timezone?: string;
  roleId?: string;
}

export interface UpdateUserInput {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  timezone?: string;
  status?: 'Active' | 'Disabled';
  roleId?: string;
}

export interface PaginationInput {
  skip: number;
  take: number;
}

export interface IUserRepository {
  findOne(where: UserFindInput): Promise<User | null>;
  findOneWithPassword(where: UserFindInput): Promise<User | null>;
  findMany(
    params: { where?: UserFindInput } & PaginationInput
  ): Promise<User[]>;
  count(where?: UserFindInput): Promise<number>;
  exists(where: UserFindInput): Promise<boolean>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<void>;
}
