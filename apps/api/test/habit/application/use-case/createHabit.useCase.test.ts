import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { CreateHabitUseCase } from '../../../../src/modules/habit/application/use-case/createHabit.useCase';
import {
  Habit,
  type HabitProps,
} from '../../../../src/modules/habit/domain/entities/habit.entity';
import {
  HabitGoal,
  HabitId,
  HabitReminder,
  HabitSchedule,
  HabitStatus,
  TimeOfDay,
} from '../../../../src/modules/habit/domain/value-objects';

describe('[Habit][UseCase] CreateHabitUseCase', () => {
  let createHabitUseCase: CreateHabitUseCase;
  let mockHabitRepository: IHabitRepository;

  const baseHabitProps: HabitProps = {
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
  };

  function createMockHabit(overrides: Partial<HabitProps> = {}): Habit {
    return Habit.reconstitute({ ...baseHabitProps, ...overrides });
  }

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

    createHabitUseCase = new CreateHabitUseCase(mockHabitRepository);
  });

  it('should create a habit with daily schedule', async () => {
    const mockHabit = createMockHabit();
    vi.mocked(mockHabitRepository.create).mockResolvedValue(mockHabit);

    const command = {
      userId: 'user-123',
      name: 'Exercise',
      description: 'Daily exercise routine',
      schedule: { type: 'daily' as const },
      goal: { unit: 'minutes', period: 'day' as const, target: 30 },
      timeOfDay: 'morning' as const,
      reminder: { enabled: false },
    };

    const result = await createHabitUseCase.execute(command);

    expect(result).toBe(mockHabit);
    expect(mockHabitRepository.create).toHaveBeenCalledWith({
      userId: 'user-123',
      name: 'Exercise',
      description: 'Daily exercise routine',
      schedule: {
        type: 'daily',
        daysOfWeek: undefined,
        weeklyDay: undefined,
        weeklyFlexible: false,
      },
      goal: { unit: 'minutes', period: 'day', target: 30 },
      timeOfDay: 'morning',
      reminder: { enabled: false },
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('should create a habit with weekly schedule', async () => {
    const weeklyHabit = createMockHabit({
      id: HabitId.create('223e4567-e89b-12d3-a456-426614174000'),
      schedule: HabitSchedule.weekly(1, false),
    });

    vi.mocked(mockHabitRepository.create).mockResolvedValue(weeklyHabit);

    const command = {
      userId: 'user-123',
      name: 'Weekly Review',
      schedule: {
        type: 'weekly' as const,
        weeklyDay: 1,
        weeklyFlexible: false,
      },
      goal: { unit: 'times', period: 'week' as const, target: 1 },
      timeOfDay: 'morning' as const,
      reminder: { enabled: false },
    };

    const result = await createHabitUseCase.execute(command);

    expect(result).toBe(weeklyHabit);
    expect(mockHabitRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        schedule: {
          type: 'weekly',
          daysOfWeek: undefined,
          weeklyDay: 1,
          weeklyFlexible: false,
        },
      })
    );
  });

  it('should create a habit with custom schedule', async () => {
    const customHabit = createMockHabit({
      id: HabitId.create('323e4567-e89b-12d3-a456-426614174000'),
      schedule: HabitSchedule.custom([1, 3, 5]),
    });

    vi.mocked(mockHabitRepository.create).mockResolvedValue(customHabit);

    const command = {
      userId: 'user-123',
      name: 'Gym',
      schedule: { type: 'custom' as const, daysOfWeek: [1, 3, 5] },
      goal: { unit: 'times', period: 'day' as const, target: 1 },
      timeOfDay: 'afternoon' as const,
      reminder: { enabled: false },
    };

    const result = await createHabitUseCase.execute(command);

    expect(result).toBe(customHabit);
    expect(mockHabitRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        schedule: {
          type: 'custom',
          daysOfWeek: [1, 3, 5],
          weeklyDay: undefined,
          weeklyFlexible: false,
        },
      })
    );
  });

  it('should create a habit with reminder enabled', async () => {
    const habitWithReminder = createMockHabit({
      id: HabitId.create('423e4567-e89b-12d3-a456-426614174000'),
      reminder: HabitReminder.enabled('08:00'),
    });

    vi.mocked(mockHabitRepository.create).mockResolvedValue(habitWithReminder);

    const command = {
      userId: 'user-123',
      name: 'Morning Meditation',
      schedule: { type: 'daily' as const },
      goal: { unit: 'minutes', period: 'day' as const, target: 10 },
      timeOfDay: 'morning' as const,
      reminder: { enabled: true, time: '08:00' },
    };

    const result = await createHabitUseCase.execute(command);

    expect(result).toBe(habitWithReminder);
    expect(mockHabitRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reminder: { enabled: true, time: '08:00' },
      })
    );
  });

  it('should create a habit with date range', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    const habitWithDates = createMockHabit({
      id: HabitId.create('523e4567-e89b-12d3-a456-426614174000'),
      startDate,
      endDate,
    });

    vi.mocked(mockHabitRepository.create).mockResolvedValue(habitWithDates);

    const command = {
      userId: 'user-123',
      name: 'Year Challenge',
      schedule: { type: 'daily' as const },
      goal: { unit: 'times', period: 'day' as const, target: 1 },
      timeOfDay: 'anytime' as const,
      reminder: { enabled: false },
      startDate,
      endDate,
    };

    const result = await createHabitUseCase.execute(command);

    expect(result).toBe(habitWithDates);
    expect(mockHabitRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate,
        endDate,
      })
    );
  });
});
