import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { UpdateHabitUseCase } from '../../../../src/modules/habit/application/use-case/updateHabit.useCase';
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

describe('[Habit][UseCase] UpdateHabitUseCase', () => {
  let updateHabitUseCase: UpdateHabitUseCase;
  let mockHabitRepository: IHabitRepository;

  const createMockHabit = () =>
    Habit.reconstitute({
      id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Exercise',
      description: 'Daily exercise',
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

    updateHabitUseCase = new UpdateHabitUseCase(mockHabitRepository);
  });

  it('should update habit name', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      name: 'New Exercise Name',
    });

    expect(result.name).toBe('New Exercise Name');
    expect(mockHabitRepository.update).toHaveBeenCalled();
  });

  it('should update habit description', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      description: 'Updated description',
    });

    expect(result.description).toBe('Updated description');
  });

  it('should update habit schedule', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      schedule: { type: 'weekly', weeklyDay: 1 },
    });

    expect(result.schedule.type).toBe('weekly');
    expect(result.schedule.weeklyDay).toBe(1);
  });

  it('should update habit goal', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      goal: { unit: 'hours', period: 'week', target: 5 },
    });

    expect(result.goal.unit).toBe('hours');
    expect(result.goal.period).toBe('week');
    expect(result.goal.target).toBe(5);
  });

  it('should update habit timeOfDay', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      timeOfDay: 'evening',
    });

    expect(result.timeOfDay.value).toBe('evening');
  });

  it('should update habit reminder', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      reminder: { enabled: true, time: '09:00' },
    });

    expect(result.reminder.enabled).toBe(true);
    expect(result.reminder.time).toBe('09:00');
  });

  it('should update habit date range', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-06-30');

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      startDate,
      endDate,
    });

    expect(result.startDate).toEqual(startDate);
    expect(result.endDate).toEqual(endDate);
  });

  it('should throw HabitNotFoundError when habit not found', async () => {
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(null);

    await expect(
      updateHabitUseCase.execute({
        id: 'non-existent-id',
        userId: 'user-123',
        name: 'New Name',
      })
    ).rejects.toThrow(HabitNotFoundError);

    expect(mockHabitRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error when updating blocked habit', async () => {
    const blockedHabit = Habit.reconstitute({
      id: HabitId.create('123e4567-e89b-12d3-a456-426614174000'),
      userId: 'user-123',
      name: 'Exercise',
      schedule: HabitSchedule.daily(),
      goal: HabitGoal.create({ unit: 'minutes', period: 'day', target: 30 }),
      timeOfDay: TimeOfDay.create('morning'),
      reminder: HabitReminder.disabled(),
      status: HabitStatus.blocked(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(mockHabitRepository.findById).mockResolvedValue(blockedHabit);

    await expect(
      updateHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
        name: 'New Name',
      })
    ).rejects.toThrow('Cannot perform operation on a blocked habit');
  });

  it('should throw error when updating deleted habit', async () => {
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
      updateHabitUseCase.execute({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
        name: 'New Name',
      })
    ).rejects.toThrow('Cannot perform operation on a deleted habit');
  });

  it('should update multiple fields at once', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
    vi.mocked(mockHabitRepository.update).mockImplementation(
      async (habit) => habit
    );

    const result = await updateHabitUseCase.execute({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      name: 'Updated Habit',
      description: 'New description',
      timeOfDay: 'afternoon',
    });

    expect(result.name).toBe('Updated Habit');
    expect(result.description).toBe('New description');
    expect(result.timeOfDay.value).toBe('afternoon');
  });
});
