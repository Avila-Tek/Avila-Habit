import { UserRepository } from '../ports/UserRepository';

export class FindUserByIdUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string) {
    return this.userRepository.findById(id);
  }
}
