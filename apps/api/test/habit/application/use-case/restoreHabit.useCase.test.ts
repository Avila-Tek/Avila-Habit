import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { RestoreHabitUseCase } from '../../../../src/modules/habit/application/use-case/restoreHabit.useCase';
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

describe('[Habit][UseCase] RestoreHabitUseCase', () => {
  let restoreHabitUseCase: RestoreHabitUseCase;
  let mockHabitRepository: IHabitRepository;

  const createDeletedMockHabit = () =>
    Habit.reconstitute({
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

  const createActiveMockHabit = () =>
    Habit.reconstitute({
      id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Exercise',
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

    restoreHabitUseCase = new RestoreHabitUseCase(mockHabitRepository);
  });

  it('should restore a deleted habit', async () => {
    const deletedHabit = createDeletedMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(deletedHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await restoreHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
    });

    expect(result.isActive).toBe(true);
    expect(mockHabitRepository.findById).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      true
    );
    expect(mockHabitRepository.update).toHaveBeenCalled();
  });

  it('should throw HabitNotFoundError when habit not found', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(null);

    await expect(
      restoreHabitUseCase.execute({ id: 'non-existent-id', userId: 'user-123' })
    ).rejects.toThrow(HabitNotFoundError);

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when trying to restore active habit', async () => {
    const activeHabit = createActiveMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(activeHabit);

    await expect(
      restoreHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
      })
    ).rejects.toThrow('Habit is not deleted');

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should search for deleted habits with includeDeleted true', async () => {
    const deletedHabit = createDeletedMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(deletedHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    await restoreHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
    });

    expect(mockHabitRepository.findById).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      true
    );
  });
});
