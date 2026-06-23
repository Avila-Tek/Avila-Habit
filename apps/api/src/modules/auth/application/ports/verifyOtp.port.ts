import type { User } from '@/modules/user/domain/entities/user.entity';

export interface VerifyOtpCommand {
  email: string;
  otp: string;
}

export interface VerifyOtpResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IVerifyOtpUseCase {
  execute(command: VerifyOtpCommand): Promise<VerifyOtpResult>;
}
