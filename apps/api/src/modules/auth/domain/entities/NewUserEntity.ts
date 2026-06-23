import { Email } from '@/modules/shared/domain/value-objects/Email';
import { Password } from '@/modules/shared/domain/value-objects/Password';

interface CreateNewUserAttributes {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class NewUserEntity {
  public firstName: string;
  public lastName: string;
  public email: Email;
  public password: Password;

  private constructor(attributes: CreateNewUserAttributes) {
    this.firstName = attributes.firstName;
    this.lastName = attributes.lastName;
    this.email = Email.create(attributes.email);
    this.password = Password.create(attributes.password);
  }

  static create(attributes: CreateNewUserAttributes) {
    return new NewUserEntity(attributes);
  }

  toObject() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email.toString(),
      password: this.password.toString(),
    };
  }
}
