import { FindUserByEmailUseCase } from '../../application/use-case/FindUserByEmailUseCase';
import { FindUserByIdUseCase } from '../../application/use-case/FindUserByIdUseCase';
import { RegisterUserUseCase } from '../../application/use-case/RegisterUserUseCase';
import { UpdateUserUseCase } from '../../application/use-case/UpdateUserUseCase';

interface AdapterUseCases {
  registerUserUseCase: RegisterUserUseCase;
  updateUserUseCase: UpdateUserUseCase;
  findUserByIdUseCase: FindUserByIdUseCase;
  findUserByEmailUseCase: FindUserByEmailUseCase;
}

export class UserInternalAdapter {
  private useCases: AdapterUseCases;

  constructor(useCases: AdapterUseCases) {
    this.useCases = useCases;
  }

  async registerUser(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return this.useCases.registerUserUseCase.execute(input);
  }

  async updateUser(input: Partial<any>) {
    return this.useCases.updateUserUseCase.execute(input);
  }

  async findUserById(id: string) {
    return this.useCases.findUserByIdUseCase.execute(id);
  }

  async findUserByEmail(email: string) {
    return this.useCases.findUserByEmailUseCase.execute(email);
  }
}
