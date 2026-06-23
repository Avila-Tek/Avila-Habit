import {
  CreateUserRepositoryInput,
  UserRepository,
} from '../../application/ports/UserRepository';
import { UserEntity } from '../../domain/entities/UserEntity';

export class UserAmazingDBRepository implements UserRepository {
  create(user: CreateUserRepositoryInput): Promise<UserEntity> {
    return new Promise((resolve) =>
      resolve(
        UserEntity.create({
          id: 'mocked-user-id',
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    );
  }

  findById(id: string): Promise<UserEntity> {
    return new Promise((resolve) =>
      resolve(
        UserEntity.create({
          id,
          firstName: 'mocked-first-name',
          lastName: 'mocked-last-name',
          email: 'mocked-first-name@mocked.com',
          password: 'mocked-password',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    );
  }
  findByEmail(email: string): Promise<UserEntity> {
    return new Promise((resolve) =>
      resolve(
        UserEntity.create({
          id: 'mocked-user-id',
          firstName: 'mocked-first-name',
          lastName: 'mocked-last-name',
          email,
          password: 'mocked-password',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    );
  }

  save(user: UserEntity): Promise<UserEntity> {
    return new Promise((resolve) =>
      resolve(
        UserEntity.create({
          id: 'mocked-user-id',
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    );
  }
}
