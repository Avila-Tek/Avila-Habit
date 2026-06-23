import { BetterAuthError } from '@/modules/auth/domain/errors/auth.errors';
import type { IUserRepository } from '@/modules/user/application/ports/userRepository.port';
import type { IAuthProvider } from '../ports/authProvider.port';
import type { IRoleRepository } from '../ports/roleRepository.port';
import type {
  IVerifyOtpUseCase,
  VerifyOtpCommand,
  VerifyOtpResult,
} from '../ports/verifyOtp.port';

const BETTER_AUTH_PASSWORD_PLACEHOLDER = '***MANAGED_BY_BETTER_AUTH***';

export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authProvider: IAuthProvider,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(command: VerifyOtpCommand): Promise<VerifyOtpResult> {
    if (!this.authProvider.verifyOtp) {
      throw new BetterAuthError(
        'OTP verification is not supported by this auth provider'
      );
    }

    const authResult = await this.authProvider.verifyOtp({
      email: command.email,
      otp: command.otp,
    });

    let user = await this.userRepository.findOne({ email: command.email });

    if (!user) {
      // Get default USER role
      const userRole = await this.roleRepository.findByCode('USER');
      if (!userRole) {
        throw new Error(
          'Default USER role not found. Please run database seeds.'
        );
      }

      user = await this.userRepository.create({
        id: authResult.user.id,
        email: authResult.user.email,
        passwordHash: BETTER_AUTH_PASSWORD_PLACEHOLDER,
        firstName: authResult.user.firstName ?? null,
        lastName: authResult.user.lastName ?? null,
        roleId: userRole.id,
      });
    }

    return {
      user,
      accessToken: authResult.session.accessToken,
      refreshToken: authResult.session.refreshToken,
    };
  }
}
