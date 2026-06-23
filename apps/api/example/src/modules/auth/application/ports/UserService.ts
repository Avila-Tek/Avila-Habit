import { AuthenticatedUserEntity } from '../../domain/entities/AuthenticatedUserEntity';
import { NewUserEntity } from '../../domain/entities/NewUserEntity';

export interface UserService {
  findById(id: string): Promise<AuthenticatedUserEntity | null>;
  findByEmail(email: string): Promise<AuthenticatedUserEntity | null>;
  create(user: NewUserEntity): Promise<AuthenticatedUserEntity | null>;
}
