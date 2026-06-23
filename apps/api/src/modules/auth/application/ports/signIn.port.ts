import type { User } from '@/modules/user/domain/entities/user.entity';

export interface SignInCommand {
  email: string;
  password: string;
}

export interface SignInResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ISignInUseCase {
  execute(command: SignInCommand): Promise<SignInResult>;
}
