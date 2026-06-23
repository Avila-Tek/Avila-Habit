import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import { FindHabitsUseCase } from '../../../../src/modules/habit/application/use-case/findHabits.useCase';
import { Habit } from '../../../../src/modules/habit/domain/entities/habit.entity';
import {
  HabitGoal,
  HabitId,
  HabitReminder,
  HabitSchedule,
  HabitStatus,
  TimeOfDay,
} from '../../../../src/modules/habit/domain/value-objects';

describe('[Habit][UseCase] FindHabitsUseCase', () => {
  let findHabitsUseCase: FindHabitsUseCase;
  let mockHabitRepository: IHabitRepository;

  const createMockHabit = (id: string, name: string) =>
    Habit.reconstitute({
      id: HabitId.create(id),
      userId: 'user-123',
      name,
      schedule: HabitSchedule.daily(),
      goal: HabitGoal.create({ unit: 'times', period: 'day', target: 1 }),
      timeOfDay: TimeOfDay.create('morning'),
      reminder: HabitReminder.disabled(),
      status: HabitStatus.active(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const mockHabits = [
    createMockHabit('123e4567-e89b-12d3-a456-426614174001', 'Exercise'),
    createMockHabit('123e4567-e89b-12d3-a456-426614174002', 'Reading'),
    createMockHabit('123e4567-e89b-12d3-a456-426614174003', 'Meditation'),
  ];

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

    findHabitsUseCase = new FindHabitsUseCase(mockHabitRepository);
  });

  it('should return paginated habits with page info', async () => {
    vi.mocked(mockHabitRepository.findByUserId).mockResolvedValue(mockHabits);
    vi.mocked(mockHabitRepository.count).mockResolvedValue(3);

    const result = await findHabitsUseCase.execute({
      userId: 'user-123',
      page: 1,
      perPage: 10,
    });

    expect(result.items).toEqual(mockHabits);
    expect(result.pageInfo).toEqual({
      currentPage: 1,
      perPage: 10,
      itemCount: 3,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    expect(mockHabitRepository.findByUserId).toHaveBeenCalledWith('user-123', {
      page: 1,
      perPage: 10,
      includeDeleted: undefined,
    });
  });

  it('should return empty list when no habits exist', async () => {
    vi.mocked(mockHabitRepository.findByUserId).mockResolvedValue([]);
    vi.mocked(mockHabitRepository.count).mockResolvedValue(0);

    const result = await findHabitsUseCase.execute({
      userId: 'user-123',
      page: 1,
      perPage: 10,
    });

    expect(result.items).toEqual([]);
    expect(result.pageInfo).toEqual({
      currentPage: 1,
      perPage: 10,
      itemCount: 0,
      pageCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });

  it('should calculate pagination correctly for multiple pages', async () => {
    vi.mocked(mockHabitRepository.findByUserId).mockResolvedValue(
      mockHabits.slice(0, 2)
    );
    vi.mocked(mockHabitRepository.count).mockResolvedValue(5);

    const result = await findHabitsUseCase.execute({
      userId: 'user-123',
      page: 1,
      perPage: 2,
    });

    expect(result.pageInfo).toEqual({
      currentPage: 1,
      perPage: 2,
      itemCount: 2,
      pageCount: 3,
      hasPreviousPage: false,
      hasNextPage: true,
    });
  });

  it('should indicate previous page exists on page 2', async () => {
    vi.mocked(mockHabitRepository.findByUserId).mockResolvedValue([
      mockHabits[2],
    ]);
    vi.mocked(mockHabitRepository.count).mockResolvedValue(5);

    const result = await findHabitsUseCase.execute({
      userId: 'user-123',
      page: 2,
      perPage: 2,
    });

    expect(result.pageInfo.hasPreviousPage).toBe(true);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('should include deleted habits when requested', async () => {
    vi.mocked(mockHabitRepository.findByUserId).mockResolvedValue(mockHabits);
    vi.mocked(mockHabitRepository.count).mockResolvedValue(3);

    await findHabitsUseCase.execute({
      userId: 'user-123',
      page: 1,
      perPage: 10,
      includeDeleted: true,
    });

    expect(mockHabitRepository.findByUserId).toHaveBeenCalledWith('user-123', {
      page: 1,
      perPage: 10,
      includeDeleted: true,
    });
    expect(mockHabitRepository.count).toHaveBeenCalledWith('user-123', true);
  });
});
