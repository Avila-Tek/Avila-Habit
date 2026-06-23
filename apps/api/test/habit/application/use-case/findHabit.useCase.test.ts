import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { FindHabitUseCase } from '../../../../src/modules/habit/application/use-case/findHabit.useCase';
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

describe('[Habit][UseCase] FindHabitUseCase', () => {
  let findHabitUseCase: FindHabitUseCase;
  let mockHabitRepository: IHabitRepository;

  const mockHabit = Habit.reconstitute({
    id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
    userId: 'user-123',
    name: 'Exercise',
    description: 'Daily exercise routine',
    schedule: HabitSchedule.daily(),
    goal: HabitGoal.create({ unit: 'minutes', period: 'day', target: 30 }),
    timeOfDay: TimeOfDay.create('morning'),
    reminder: HabitReminder.disabled(),
    status: HabitStatus.active(),
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

    findHabitUseCase = new FindHabitUseCase(mockHabitRepository);
  });

  it('should return habit when found by id and userId matches', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);

    const result = await findHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
    });

    expect(result).toBe(mockHabit);
    expect(mockHabitRepository.findById).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      undefined
    );
  });

  it('should throw HabitNotFoundError when habit not found', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(null);

    await expect(
      findHabitUseCase.execute({
        id: 'non-existent-id',
        userId: 'user-123',
      })
    ).rejects.toThrow(HabitNotFoundError);
  });

  it('should throw HabitNotFoundError when userId does not match', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);

    await expect(
      findHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'different-user',
      })
    ).rejects.toThrow(HabitNotFoundError);
  });

  it('should find deleted habit when includeDeleted is true', async () => {
    const deletedHabit = Habit.reconstitute({
      id: HabitId.create('223e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Deleted Exercise',
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

    const result = await findHabitUseCase.execute({
      id: '223e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      includeDeleted: true,
    });

    expect(result).toBe(deletedHabit);
    expect(mockHabitRepository.findById).toHaveBeenCalledWith(
      '223e4567-e89b-12d3-a456-426614174000',
      true
    );
  });
});
