import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';

interface CreateAuthenticatedUserAttributes {
  id: string;
  email: string;
  password: string;
}

export class AuthenticatedUserEntity {
  public readonly id: string;
  public email: Email;
  public password: Password;

  private constructor(attributes: CreateAuthenticatedUserAttributes) {
    this.id = attributes.id;
    this.email = Email.create(attributes.email);
    this.password = Password.fromHash(attributes.password);
  }

  static create(attributes: CreateAuthenticatedUserAttributes) {
    return new AuthenticatedUserEntity(attributes);
  }
}
