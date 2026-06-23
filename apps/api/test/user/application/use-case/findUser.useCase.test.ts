import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Email } from '../../../../src/modules/shared/domain/value-objects/Email';
import type { IUserRepository } from '../../../../src/modules/user/application/ports/userRepository.port';
import { FindUserUseCase } from '../../../../src/modules/user/application/use-case/findUser.useCase';
import { User } from '../../../../src/modules/user/domain/entities/user.entity';
import { UserNotFoundError } from '../../../../src/modules/user/domain/errors/user.errors';
import { UserId } from '../../../../src/modules/user/domain/value-objects/userId.vo';

describe('[User][UseCase] FindUserUseCase', () => {
  let findUserUseCase: FindUserUseCase;
  let mockUserRepository: IUserRepository;

  const mockUser = User.reconstitute({
    id: UserId.create('123e4567-e89b-12d3-a456-426614174000'),
    firstName: 'John',
    lastName: 'Doe',
    email: Email.create('john@example.com'),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockUserRepository = {
      findOne: vi.fn(),
      findOneWithPassword: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      exists: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    findUserUseCase = new FindUserUseCase(mockUserRepository);
  });

  it('should return user when found by id', async () => {
    vi.mocked(mockUserRepository.findOne).mockResolvedValue(mockUser);

    const result = await findUserUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(result).toBe(mockUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
  });

  it('should throw UserNotFoundError when user not found', async () => {
    vi.mocked(mockUserRepository.findOne).mockResolvedValue(null);

    await expect(
      findUserUseCase.execute({ id: 'non-existent-id' })
    ).rejects.toThrow(UserNotFoundError);
  });
});
