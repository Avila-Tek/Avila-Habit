import type { AuthenticatedUserEntity } from '../../domain/entities/AuthenticatedUserEntity';

export interface CreateUserWithHashedPasswordInput {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
}

export interface UserService {
  findById(id: string): Promise<AuthenticatedUserEntity | null>;
  findByIdWithPassword(id: string): Promise<AuthenticatedUserEntity | null>;
  findByEmail(email: string): Promise<AuthenticatedUserEntity | null>;
  findByEmailWithPassword(
    email: string
  ): Promise<AuthenticatedUserEntity | null>;
  createWithHashedPassword(
    input: CreateUserWithHashedPasswordInput
  ): Promise<AuthenticatedUserEntity | null>;
  exists(email: string): Promise<boolean>;
}
