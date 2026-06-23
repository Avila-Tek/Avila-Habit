import { UserRepository } from '../ports/UserRepository';

interface RegisterUserUseCaseInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(input: RegisterUserUseCaseInput) {
    const user = await this.userRepository.save(input);
    return user;
  }
}
