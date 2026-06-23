import type { User } from '@/modules/user/domain/entities/user.entity';
import { UserNotFoundError } from '@/modules/user/domain/errors/user.errors';
import type {
  IUpdateUserUseCase,
  UpdateUserCommand,
} from '../ports/updateUser.port';
import type { IUserRepository } from '../ports/userRepository.port';

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { id, ...updateData } = command;

    const user = await this.userRepository.update(id, updateData);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }
}
