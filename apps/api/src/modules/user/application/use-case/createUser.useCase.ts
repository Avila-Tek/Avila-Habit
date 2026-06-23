import type { User } from '@/modules/user/domain/entities/user.entity';
import { UserAlreadyExistsError } from '@/modules/user/domain/errors/user.errors';
import type {
  CreateUserCommand,
  ICreateUserUseCase,
} from '../ports/createUser.port';
import type { IUserRepository } from '../ports/userRepository.port';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const exists = await this.userRepository.exists({ email: command.email });

    if (exists) {
      throw new UserAlreadyExistsError(command.email);
    }

    const user = await this.userRepository.create({
      id: command.id,
      email: command.email,
      passwordHash: command.passwordHash,
      firstName: command.firstName ?? null,
      lastName: command.lastName ?? null,
      timezone: command.timezone,
    });

    return user;
  }
}
