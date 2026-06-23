import {
  InvalidTokenError,
  UserDisabledError,
} from '@/modules/auth/domain/errors/auth.errors';
import type { IUserRepository } from '@/modules/user/application/ports/userRepository.port';
import type { User } from '@/modules/user/domain/entities/user.entity';
import { UserNotFoundError } from '@/modules/user/domain/errors/user.errors';
import type { IAuthProvider } from '../ports/authProvider.port';
import type {
  GetCurrentUserQuery,
  IGetCurrentUserUseCase,
} from '../ports/getCurrentUser.port';

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authProvider: IAuthProvider
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<User> {
    const tokenResult = await this.authProvider.verifyToken(query.accessToken);

    if (!tokenResult) {
      throw new InvalidTokenError();
    }

    const user = await this.userRepository.findOne({ id: tokenResult.userId });

    if (!user) {
      throw new UserNotFoundError(tokenResult.userId);
    }

    if (!user.isActive()) {
      throw new UserDisabledError();
    }

    return user;
  }
}
