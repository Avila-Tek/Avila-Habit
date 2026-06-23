import { UserRepository } from '../ports/UserRepository';

interface UpdateUserUseCaseInput {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export class UpdateUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(input: UpdateUserUseCaseInput) {
    const updatedUser = await this.userRepository.save(input);
    return updatedUser;
  }
}
