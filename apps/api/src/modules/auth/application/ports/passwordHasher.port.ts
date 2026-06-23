export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(hashedPassword: string, plainPassword: string): Promise<boolean>;
}
