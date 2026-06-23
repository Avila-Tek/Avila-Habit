import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { BlockHabitUseCase } from '../../../../src/modules/habit/application/use-case/blockHabit.useCase';
import { Habit } from '../../../../src/modules/habit/domain/entities/habit.entity';
import { HabitNotFoundError } from '../../../../src/modules/habit/domain/errors/habit.errors';
import {
  HabitGoal,
  HabitId,
  HabitReminder,
  HabitSchedule,
  HabitStatus,
  TimeOfDay,
} from '../../../../src/modules/habit/domain/value-objects';

describe('[Habit][UseCase] BlockHabitUseCase', () => {
  let blockHabitUseCase: BlockHabitUseCase;
  let mockHabitRepository: IHabitRepository;

  const createMockHabit = (status: HabitStatus = HabitStatus.active()) =>
    Habit.reconstitute({
      id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Exercise',
      schedule: HabitSchedule.daily(),
      goal: HabitGoal.create({ unit: 'minutes', period: 'day', target: 30 }),
      timeOfDay: TimeOfDay.create('morning'),
      reminder: HabitReminder.disabled(),
      status,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    mockHabitRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      count: vi.fn(),
      exists: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      hardDelete: vi.fn(),
    };

    blockHabitUseCase = new BlockHabitUseCase(mockHabitRepository);
  });

  it('should block an active habit', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await blockHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
    });

    expect(result.status.isBlocked()).toBe(true);
    expect(mockHabitRepository.update).toHaveBeenCalled();
  });

  it('should block a paused habit', async () => {
    const pausedHabit = createMockHabit(HabitStatus.paused());
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(pausedHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await blockHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
    });

    expect(result.status.isBlocked()).toBe(true);
  });

  it('should throw HabitNotFoundError when habit not found', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(null);

    await expect(
      blockHabitUseCase.execute({ id: 'non-existent-id', userId: 'user-123' })
    ).rejects.toThrow(HabitNotFoundError);

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when trying to block already blocked habit', async () => {
    const blockedHabit = createMockHabit(HabitStatus.blocked());
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(blockedHabit);

    await expect(
      blockHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
      })
    ).rejects.toThrow('Habit is already blocked');

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when trying to block deleted habit', async () => {
    const deletedHabit = Habit.reconstitute({
      id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Exercise',
      schedule: HabitSchedule.daily(),
      goal: HabitGoal.create({ unit: 'minutes', period: 'day', target: 30 }),
      timeOfDay: TimeOfDay.create('morning'),
      reminder: HabitReminder.disabled(),
      status: HabitStatus.active(),
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockHabitRepository.findById).mockResolvedValue(deletedHabit);

    await expect(
      blockHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
      })
    ).rejects.toThrow('Cannot perform operation on a deleted habit');

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });
});
