import { PasswordMismatchError } from '@/modules/auth/domain/errors/auth.errors';
import type { IUserRepository } from '@/modules/user/application/ports/userRepository.port';
import { UserAlreadyExistsError } from '@/modules/user/domain/errors/user.errors';
import type { IAuthProvider } from '../ports/authProvider.port';
import type { IRoleRepository } from '../ports/roleRepository.port';
import type {
  ISignUpUseCase,
  SignUpCommand,
  SignUpResult,
} from '../ports/signUp.port';

const SUPABASE_PASSWORD_PLACEHOLDER = '***MANAGED_BY_SUPABASE***';

export class SignUpUseCase implements ISignUpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authProvider: IAuthProvider,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpResult> {
    if (command.password !== command.rePassword) {
      throw new PasswordMismatchError();
    }

    const existingUser = await this.userRepository.exists({
      email: command.email,
    });
    if (existingUser) {
      throw new UserAlreadyExistsError(command.email);
    }

    // Get default USER role
    const userRole = await this.roleRepository.findByCode('USER');
    if (!userRole) {
      throw new Error(
        'Default USER role not found. Please run database seeds.'
      );
    }

    const authResult = await this.authProvider.signUp({
      email: command.email,
      password: command.password,
      firstName: command.firstName,
      lastName: command.lastName,
    });

    if (authResult.requiresEmailConfirmation) {
      // Update the user created by Better Auth with firstName, lastName and roleId
      if (authResult.user?.id) {
        await this.userRepository.update(authResult.user.id, {
          firstName: command.firstName ?? null,
          lastName: command.lastName ?? null,
          roleId: userRole.id,
        });
      }
      return {
        user: null,
        requiresEmailConfirmation: true,
      };
    }

    if (!authResult.user) {
      return {
        user: null,
        requiresEmailConfirmation: true,
      };
    }

    const user = await this.userRepository.create({
      id: authResult.user.id,
      email: authResult.user.email,
      passwordHash: SUPABASE_PASSWORD_PLACEHOLDER,
      firstName: command.firstName ?? null,
      lastName: command.lastName ?? null,
      roleId: userRole.id,
    });

    return {
      user,
      requiresEmailConfirmation: false,
    };
  }
}
