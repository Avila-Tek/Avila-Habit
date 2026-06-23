import type { IAuthProvider } from '../ports/authProvider.port';
import type { ISignOutUseCase, SignOutCommand } from '../ports/signOut.port';

export class SignOutUseCase implements ISignOutUseCase {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(command: SignOutCommand): Promise<void> {
    await this.authProvider.signOut(command.accessToken);
  }
}
