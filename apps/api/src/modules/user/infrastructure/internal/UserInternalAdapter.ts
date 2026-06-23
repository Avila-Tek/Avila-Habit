import type { ICreateUserUseCase } from '../../application/ports/createUser.port';
import type { IFindUserUseCase } from '../../application/ports/findUser.port';
import type { IUserRepository } from '../../application/ports/userRepository.port';
import type { User } from '../../domain/entities/user.entity';

interface AdapterUseCases {
  findUserUseCase: IFindUserUseCase;
  createUserUseCase: ICreateUserUseCase;
}

export class UserInternalAdapter {
  private useCases: AdapterUseCases;
  private userRepository: IUserRepository;

  constructor(useCases: AdapterUseCases, userRepository: IUserRepository) {
    this.useCases = useCases;
    this.userRepository = userRepository;
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.useCases.findUserUseCase.execute({ id });
    } catch {
      return null;
    }
  }

  async findUserByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepository.findOne({ id });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.useCases.findUserUseCase.execute({ email });
    } catch {
      return null;
    }
  }

  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({ email });
  }

  async createUser(input: {
    id: string;
    email: string;
    passwordHash: string;
    firstName?: string | null;
    lastName?: string | null;
    timezone?: string;
  }): Promise<User> {
    return this.useCases.createUserUseCase.execute(input);
  }

  async userExists(email: string): Promise<boolean> {
    return this.userRepository.exists({ email });
  }
}
