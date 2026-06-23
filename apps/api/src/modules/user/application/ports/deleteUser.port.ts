export interface DeleteUserCommand {
  id: string;
}

export interface IDeleteUserUseCase {
  execute(command: DeleteUserCommand): Promise<void>;
}
