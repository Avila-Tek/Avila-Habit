import type { User } from '@/modules/user/domain/entities/user.entity';

export interface SignUpCommand {
  email: string;
  password: string;
  rePassword: string;
  firstName?: string;
  lastName?: string;
}

export interface SignUpResult {
  user: User | null;
  requiresEmailConfirmation: boolean;
}

export interface ISignUpUseCase {
  execute(command: SignUpCommand): Promise<SignUpResult>;
}
