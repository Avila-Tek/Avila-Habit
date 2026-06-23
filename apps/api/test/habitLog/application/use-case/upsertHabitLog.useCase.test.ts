import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitRepository } from '../../../../src/modules/habit/application/ports/habitRepository.port';
import {
  Habit,
  type HabitProps,
} from '../../../../src/modules/habit/domain/entities/habit.entity';
import { HabitNotFoundError } from '../../../../src/modules/habit/domain/errors';
import {
  HabitGoal,
  HabitId,
  HabitReminder,
  HabitSchedule,
  HabitStatus,
  TimeOfDay,
} from '../../../../src/modules/habit/domain/value-objects';
import type { IHabitLogRepository } from '../../../../src/modules/habitLog/application/ports/habitLogRepository.port';
import { UpsertHabitLogUseCase } from '../../../../src/modules/habitLog/application/use-case/upsertHabitLog.useCase';
import {
  HabitLog,
  type HabitLogProps,
} from '../../../../src/modules/habitLog/domain/entities/habitLog.entity';
import {
  HabitNotLoggableError,
  InvalidHabitLogDataError,
} from '../../../../src/modules/habitLog/domain/errors';
import { HabitLogId } from '../../../../src/modules/habitLog/domain/value-objects';

describe('[HabitLog][UseCase] UpsertHabitLogUseCase', () => {
  let upsertHabitLogUseCase: UpsertHabitLogUseCase;
  let mockHabitLogRepository: IHabitLogRepository;
  let mockHabitRepository: IHabitRepository;

  const userId = 'user-123';
  const habitId = '123e4567-e89b-12d3-a456-426614174000';
  const habitLogId = '223e4567-e89b-12d3-a456-426614174001';

  const baseHabitProps: HabitProps = {
    id: HabitId.create(habitId),
    userId,
    name: 'Exercise',
    description: 'Daily exercise routine',
    schedule: HabitSchedule.daily(),
    goal: HabitGoal.create({ unit: 'times', period: 'day', target: 3 }),
    timeOfDay: TimeOfDay.create('morning'),
    reminder: HabitReminder.disabled(),
    status: HabitStatus.active(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const baseHabitLogProps: HabitLogProps = {
    id: HabitLogId.create(habitLogId),
    userId,
    habitId,
    logDate: new Date('2025-01-15'),
    completed: false,
    value: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function createMockHabit(overrides: Partial<HabitProps> = {}): Habit {
    return Habit.reconstitute({ ...baseHabitProps, ...overrides });
  }

  function createMockHabitLog(
    overrides: Partial<HabitLogProps> = {}
  ): HabitLog {
    return HabitLog.reconstitute({ ...baseHabitLogProps, ...overrides });
  }

  beforeEach(() => {
    mockHabitLogRepository = {
      findById: vi.fn(),
      findByHabitIdForPeriod: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    mockHabitRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      count: vi.fn(),
      exists: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      hardDelete: vi.fn(),
    };

    upsertHabitLogUseCase = new UpsertHabitLogUseCase(
      mockHabitLogRepository,
      mockHabitRepository
    );
  });

  describe('create new habit log', () => {
    it('should create a new habit log when none exists', async () => {
      const mockHabit = createMockHabit();
      const mockHabitLog = createMockHabitLog();

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(null);
      vi.mocked(mockHabitLogRepository.create).mockResolvedValue(mockHabitLog);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      const result = await upsertHabitLogUseCase.execute(command);

      expect(result).toBe(mockHabitLog);
      expect(mockHabitLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          habitId,
          value: 1,
          completed: false,
        })
      );
    });

    it('should mark as completed when value meets target on creation', async () => {
      const mockHabit = createMockHabit();
      const completedLog = createMockHabitLog({ completed: true, value: 3 });

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(null);
      vi.mocked(mockHabitLogRepository.create).mockResolvedValue(completedLog);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 3,
      };

      await upsertHabitLogUseCase.execute(command);

      expect(mockHabitLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: true,
          value: 3,
        })
      );
    });

    it('should cap value to target when exceeding on creation', async () => {
      const mockHabit = createMockHabit();
      const cappedLog = createMockHabitLog({ value: 3 });

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(null);
      vi.mocked(mockHabitLogRepository.create).mockResolvedValue(cappedLog);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 10,
      };

      await upsertHabitLogUseCase.execute(command);

      expect(mockHabitLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 3,
        })
      );
    });
  });

  describe('update existing habit log', () => {
    it('should update an existing habit log by adding value', async () => {
      const mockHabit = createMockHabit();
      const existingLog = createMockHabitLog({ value: 1 });
      const updatedLog = createMockHabitLog({ value: 2 });

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(existingLog);
      vi.mocked(mockHabitLogRepository.update).mockResolvedValue(updatedLog);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      const result = await upsertHabitLogUseCase.execute(command);

      expect(result).toBe(updatedLog);
      expect(mockHabitLogRepository.update).toHaveBeenCalled();
    });

    it('should mark as completed when accumulated value meets target', async () => {
      const mockHabit = createMockHabit();
      const existingLog = createMockHabitLog({ value: 2 });

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(existingLog);
      vi.mocked(mockHabitLogRepository.update).mockImplementation(
        async (log) => log
      );

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      const result = await upsertHabitLogUseCase.execute(command);

      expect(result.completed).toBe(true);
    });

    it('should throw error when trying to update a completed log', async () => {
      const mockHabit = createMockHabit();
      const completedLog = createMockHabitLog({ completed: true, value: 3 });

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(mockHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(completedLog);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      await expect(upsertHabitLogUseCase.execute(command)).rejects.toThrow(
        InvalidHabitLogDataError
      );
    });
  });

  describe('week normalization', () => {
    it('should normalize dates to same week start for weekly habits', async () => {
      const weeklyHabit = createMockHabit({
        goal: HabitGoal.create({ unit: 'times', period: 'week', target: 5 }),
      });
      const mockHabitLog = createMockHabitLog();

      vi.mocked(mockHabitRepository.findById).mockResolvedValue(weeklyHabit);
      vi.mocked(
        mockHabitLogRepository.findByHabitIdForPeriod
      ).mockResolvedValue(null);
      vi.mocked(mockHabitLogRepository.create).mockResolvedValue(mockHabitLog);

      const mondayDate = new Date('2025-12-29');
      const sundayDate = new Date('2026-01-04');

      const mondayNormalized = HabitLog.normalizeDateForPeriod(
        mondayDate,
        'week'
      );
      const sundayNormalized = HabitLog.normalizeDateForPeriod(
        sundayDate,
        'week'
      );

      expect(mondayNormalized.toISOString()).toBe(
        sundayNormalized.toISOString()
      );
    });

    it('should use UTC for week calculations to avoid timezone issues', async () => {
      const date1 = new Date('2025-12-29T00:00:00Z');
      const date2 = new Date('2026-01-04T23:59:59Z');

      const range1 = HabitLog.getWeekRange(date1);
      const range2 = HabitLog.getWeekRange(date2);

      expect(range1.start.toISOString()).toBe(range2.start.toISOString());
      expect(range1.end.toISOString()).toBe(range2.end.toISOString());
    });
  });

  describe('error handling', () => {
    it('should throw HabitNotFoundError when habit does not exist', async () => {
      vi.mocked(mockHabitRepository.findById).mockResolvedValue(null);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      await expect(upsertHabitLogUseCase.execute(command)).rejects.toThrow(
        HabitNotFoundError
      );
    });

    it('should throw HabitNotFoundError when habit belongs to different user', async () => {
      const otherUserHabit = createMockHabit({ userId: 'other-user' });
      vi.mocked(mockHabitRepository.findById).mockResolvedValue(otherUserHabit);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      await expect(upsertHabitLogUseCase.execute(command)).rejects.toThrow(
        HabitNotFoundError
      );
    });

    it('should throw HabitNotLoggableError when habit is deleted', async () => {
      const deletedHabit = createMockHabit({ isActive: false });
      vi.mocked(mockHabitRepository.findById).mockResolvedValue(deletedHabit);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      await expect(upsertHabitLogUseCase.execute(command)).rejects.toThrow(
        HabitNotLoggableError
      );
    });

    it('should throw HabitNotLoggableError when habit is paused', async () => {
      const pausedHabit = createMockHabit({ status: HabitStatus.paused() });
      vi.mocked(mockHabitRepository.findById).mockResolvedValue(pausedHabit);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      await expect(upsertHabitLogUseCase.execute(command)).rejects.toThrow(
        HabitNotLoggableError
      );
    });

    it('should throw HabitNotLoggableError when habit is blocked', async () => {
      const blockedHabit = createMockHabit({ status: HabitStatus.blocked() });
      vi.mocked(mockHabitRepository.findById).mockResolvedValue(blockedHabit);

      const command = {
        userId,
        habitId,
        logDate: new Date('2025-01-15'),
        value: 1,
      };

      await expect(upsertHabitLogUseCase.execute(command)).rejects.toThrow(
        HabitNotLoggableError
      );
    });
  });
});
