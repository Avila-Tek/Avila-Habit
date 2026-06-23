import type { User } from '@/modules/user/domain/entities/user.entity';
import { UserNotFoundError } from '@/modules/user/domain/errors/user.errors';
import type { FindUserQuery, IFindUserUseCase } from '../ports/findUser.port';
import type { IUserRepository } from '../ports/userRepository.port';

export class FindUserUseCase implements IFindUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: FindUserQuery): Promise<User> {
    const user = await this.userRepository.findOne(query);

    if (!user) {
      throw new UserNotFoundError(query.id ?? query.email);
    }

    return user;
  }
}
