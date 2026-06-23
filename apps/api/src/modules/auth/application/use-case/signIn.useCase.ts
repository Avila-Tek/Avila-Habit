import { UserDisabledError } from '@/modules/auth/domain/errors/auth.errors';
import type { IUserRepository } from '@/modules/user/application/ports/userRepository.port';
import { UserNotFoundError } from '@/modules/user/domain/errors/user.errors';
import type { IAuthProvider } from '../ports/authProvider.port';
import type {
  ISignInUseCase,
  SignInCommand,
  SignInResult,
} from '../ports/signIn.port';

export class SignInUseCase implements ISignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authProvider: IAuthProvider
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    const authResult = await this.authProvider.signIn({
      email: command.email,
      password: command.password,
    });

    const user = await this.userRepository.findOne({
      id: authResult.user.id,
    });

    if (!user) {
      throw new UserNotFoundError(authResult.user.id);
    }

    if (!user.isActive()) {
      throw new UserDisabledError();
    }

    return {
      user,
      accessToken: authResult.session.accessToken,
      refreshToken: authResult.session.refreshToken,
    };
  }
}
