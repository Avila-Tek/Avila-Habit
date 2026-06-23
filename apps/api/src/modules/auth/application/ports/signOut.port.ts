export interface SignOutCommand {
  accessToken: string;
}

export interface ISignOutUseCase {
  execute(command: SignOutCommand): Promise<void>;
}
