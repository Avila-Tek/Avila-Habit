import { PasswordHasher as PasswordHasherContract } from '../../application/ports/PasswordHasher';

export class PasswordHasher implements PasswordHasherContract {
  hash(password: string): Promise<string> {
    return Promise.resolve(password);
  }
}
