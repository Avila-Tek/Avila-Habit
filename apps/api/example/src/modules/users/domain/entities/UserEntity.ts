interface UserEntityProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserEntity {
  public readonly id: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public createdAt: Date;
  public updatedAt: Date;

  private constructor(props: UserEntityProps) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: UserEntityProps): UserEntity {
    return new UserEntity(props);
  }
}
