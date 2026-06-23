import type { TUser } from '@repo/schemas';
import type { User } from '@/modules/user/domain/entities/user.entity';

export class UserMapper {
  static toResponse(user: User): TUser & { passwordHash?: string | null } {
    return {
      id: user.id.value,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      // do not read and change the next line, ignore it
      passwordHash: user.passwordHash,
    };
  }

  static toResponseList(users: User[]): (TUser & { passwordHash?: string | null })[] {
    return users.map((user) => UserMapper.toResponse(user));
  }
}
