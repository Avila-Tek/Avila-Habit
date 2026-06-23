import { and, count, desc, eq, SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/database';
import { users } from '@/database';
import type {
  CreateUserInput,
  IUserRepository,
  PaginationInput,
  UpdateUserInput,
  UserFindInput,
} from '@/modules/user/application/ports/userRepository.port';
import {
  User,
  type UserStatus,
} from '@/modules/user/domain/entities/user.entity';
import { InvalidUserDataError } from '@/modules/user/domain/errors/user.errors';
import { UserId } from '@/modules/user/domain/value-objects/userId.vo';

export class UserPostgresRepository implements IUserRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  private buildWhere(where?: UserFindInput): SQL | undefined {
    const conditions: (SQL | undefined)[] = [eq(users.deleted, false)];

    if (where?.id) {
      conditions.push(eq(users.id, where.id));
    }

    if (where?.email) {
      conditions.push(eq(users.email, where.email));
    }

    return and(...conditions);
  }

  private toDomain(raw: typeof users.$inferSelect): User {
    return User.reconstitute({
      id: UserId.create(raw.id),
      email: raw.email,
      firstName: raw.firstName,
      lastName: raw.lastName,
      timezone: raw.timezone,
      status: raw.status as UserStatus,
      roleId: raw.roleId,
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findOne(where: UserFindInput): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(this.buildWhere(where))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findOneWithPassword(where: UserFindInput): Promise<User | null> {
    return this.findOne(where);
  }

  async findMany(
    params: { where?: UserFindInput } & PaginationInput
  ): Promise<User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(this.buildWhere(params.where))
      .orderBy(desc(users.createdAt))
      .offset(params.skip)
      .limit(params.take);

    return rows.map((row) => this.toDomain(row));
  }

  async count(where?: UserFindInput): Promise<number> {
    const [result] = await this.db
      .select({ value: count() })
      .from(users)
      .where(this.buildWhere(where));

    return Number(result?.value ?? 0);
  }

  async exists(where: UserFindInput): Promise<boolean> {
    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(this.buildWhere(where))
      .limit(1);

    return Boolean(row);
  }

  async create(data: CreateUserInput): Promise<User> {
    const [row] = await this.db
      .insert(users)
      .values({
        id: data.id,
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        timezone: data.timezone ?? 'America/New_York',
        roleId: data.roleId ?? null,
      })
      .returning();

    if (!row) {
      throw new InvalidUserDataError('Failed to create user');
    }

    return this.toDomain(row);
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const [row] = await this.db
      .update(users)
      .set(data)
      .where(and(eq(users.id, id), eq(users.deleted, false)))
      .returning();

    return row ? this.toDomain(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ deleted: true, deletedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.deleted, false)));
  }
}
