import { Email } from '@/modules/shared/domain/value-objects/Email';
import { Password } from '@/modules/shared/domain/value-objects/Password';

interface CreateAuthenticatedUserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthenticatedUserEntity {
  public readonly id: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public email: Email;
  public password: Password;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(attributes: CreateAuthenticatedUserAttributes) {
    this.id = attributes.id;
    this.firstName = attributes.firstName;
    this.lastName = attributes.lastName;
    this.email = Email.create(attributes.email);
    this.password = Password.fromHash(attributes.password);
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
  }

  static create(attributes: CreateAuthenticatedUserAttributes) {
    return new AuthenticatedUserEntity(attributes);
  }
}
