import type {
  DeleteUserCommand,
  IDeleteUserUseCase,
} from '../ports/deleteUser.port';
import type { IUserRepository } from '../ports/userRepository.port';

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    await this.userRepository.delete(command.id);
  }
}
