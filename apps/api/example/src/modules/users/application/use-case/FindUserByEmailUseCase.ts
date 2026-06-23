import { UserRepository } from '../ports/UserRepository';

export class FindUserByEmailUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
