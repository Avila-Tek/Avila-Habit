import type { IUserRepository } from '@/modules/user/application/ports/userRepository.port';
import type { IAuthProvider } from '../ports/authProvider.port';
import type { IRoleRepository } from '../ports/roleRepository.port';
import type {
  IVerifyEmailCallbackUseCase,
  VerifyEmailCallbackCommand,
  VerifyEmailCallbackResult,
} from '../ports/verifyEmailCallback.port';

const SUPABASE_PASSWORD_PLACEHOLDER = '***MANAGED_BY_SUPABASE***';

export class VerifyEmailCallbackUseCase implements IVerifyEmailCallbackUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authProvider: IAuthProvider,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    command: VerifyEmailCallbackCommand
  ): Promise<VerifyEmailCallbackResult> {
    const authResult = await this.authProvider.verifyEmailCallback(
      command.tokenHash,
      command.type
    );

    let user = await this.userRepository.findOne({ id: authResult.user.id });

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
        passwordHash: SUPABASE_PASSWORD_PLACEHOLDER,
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
