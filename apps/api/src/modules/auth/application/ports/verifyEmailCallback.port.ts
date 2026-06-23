import type { User } from '@/modules/user/domain/entities/user.entity';

export interface VerifyEmailCallbackCommand {
  tokenHash: string;
  type: string;
}

export interface VerifyEmailCallbackResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IVerifyEmailCallbackUseCase {
  execute(
    command: VerifyEmailCallbackCommand
  ): Promise<VerifyEmailCallbackResult>;
}
