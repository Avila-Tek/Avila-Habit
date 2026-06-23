import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { ReactivateHabitUseCase } from '../../../../src/modules/habit/application/use-case/reactivateHabit.useCase';
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

describe('[Habit][UseCase] ReactivateHabitUseCase', () => {
  let reactivateHabitUseCase: ReactivateHabitUseCase;
  let mockHabitRepository: IHabitRepository;

  const createMockHabit = (status: HabitStatus = HabitStatus.paused()) =>
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

    reactivateHabitUseCase = new ReactivateHabitUseCase(mockHabitRepository);
  });

  it('should reactivate a paused habit', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await reactivateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
    });

    expect(result.status.isActive()).toBe(true);
    expect(mockHabitRepository.update).toHaveBeenCalled();
  });

  it('should throw HabitNotFoundError when habit not found', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(null);

    await expect(
      reactivateHabitUseCase.execute({
        id: 'non-existent-id',
        userId: 'user-123',
      })
    ).rejects.toThrow(HabitNotFoundError);

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when trying to reactivate active habit', async () => {
    const activeHabit = createMockHabit(HabitStatus.active());
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(activeHabit);

    await expect(
      reactivateHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
      })
    ).rejects.toThrow('Can only reactivate a paused habit');

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when trying to reactivate blocked habit', async () => {
    const blockedHabit = createMockHabit(HabitStatus.blocked());
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(blockedHabit);

    await expect(
      reactivateHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
      })
    ).rejects.toThrow('Can only reactivate a paused habit');

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when trying to reactivate deleted habit', async () => {
    const deletedHabit = Habit.reconstitute({
      id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Exercise',
      schedule: HabitSchedule.daily(),
      goal: HabitGoal.create({ unit: 'minutes', period: 'day', target: 30 }),
      timeOfDay: TimeOfDay.create('morning'),
      reminder: HabitReminder.disabled(),
      status: HabitStatus.paused(),
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockHabitRepository.findById).mockResolvedValue(deletedHabit);

    await expect(
      reactivateHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
      })
    ).rejects.toThrow('Cannot perform operation on a deleted habit');

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });
});
