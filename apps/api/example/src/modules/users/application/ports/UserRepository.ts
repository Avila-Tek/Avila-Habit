import { UserEntity } from '../../domain/entities/UserEntity';

export interface CreateUserRepositoryInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: CreateUserRepositoryInput): Promise<UserEntity>;
  save(user: Partial<UserEntity>): Promise<UserEntity | null>;
}
