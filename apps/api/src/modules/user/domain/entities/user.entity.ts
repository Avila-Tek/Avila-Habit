import { UserId } from '../value-objects/userId.vo';

export type UserStatus = 'Active' | 'Disabled';

export interface UserProps {
  id: UserId;
  email: string;
  firstName: string | null;
  lastName: string | null;
  timezone: string;
  status: UserStatus;
  roleId: string | null;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string | null {
    return this.props.firstName;
  }

  get lastName(): string | null {
    return this.props.lastName;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get roleId(): string | null {
    return this.props.roleId;
  }

  get passwordHash(): string | null | undefined {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isActive(): boolean {
    return this.props.status === 'Active';
  }
}
