import type { Permission } from './PermissionEntity';

export interface RoleProps {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Role {
  private constructor(private readonly props: RoleProps) {}

  static create(props: RoleProps): Role {
    return new Role(props);
  }

  static reconstitute(props: RoleProps): Role {
    return new Role(props);
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get permissions(): Permission[] {
    return [...this.props.permissions];
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasPermission(permissionCode: string): boolean {
    return this.props.permissions.some(
      (permission) => permission.code.value === permissionCode.toLowerCase()
    );
  }

  getPermissionCodes(): string[] {
    return this.props.permissions.map((permission) => permission.code.value);
  }
}
