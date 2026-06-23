import { PermissionCode } from '../value-objects/PermissionCode';

export interface PermissionProps {
  id: string;
  code: PermissionCode;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Permission {
  private constructor(private readonly props: PermissionProps) {}

  static create(props: PermissionProps): Permission {
    return new Permission(props);
  }

  static reconstitute(props: PermissionProps): Permission {
    return new Permission(props);
  }

  get id(): string {
    return this.props.id;
  }

  get code(): PermissionCode {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
