import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IHabitLogRepository } from '../../../../src/modules/habitLog/application/ports/habitLogRepository.port';
import { FindHabitLogsUseCase } from '../../../../src/modules/habitLog/application/use-case/findHabitLogs.useCase';
import {
  HabitLog,
  type HabitLogProps,
} from '../../../../src/modules/habitLog/domain/entities/habitLog.entity';
import { HabitLogId } from '../../../../src/modules/habitLog/domain/value-objects';

describe('[HabitLog][UseCase] FindHabitLogsUseCase', () => {
  let findHabitLogsUseCase: FindHabitLogsUseCase;
  let mockHabitLogRepository: IHabitLogRepository;

  const userId = 'user-123';
  const habitId = '123e4567-e89b-12d3-a456-426614174000';

  const baseHabitLogProps: HabitLogProps = {
    id: HabitLogId.create('223e4567-e89b-12d3-a456-426614174001'),
    userId,
    habitId,
    logDate: new Date('2025-01-15'),
    completed: false,
    value: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

    findHabitLogsUseCase = new FindHabitLogsUseCase(mockHabitLogRepository);
  });

  describe('find habit logs', () => {
    it('should return habit logs for a user', async () => {
      const habitLogs = [
        createMockHabitLog({ logDate: new Date('2025-01-15') }),
        createMockHabitLog({
          id: HabitLogId.create('323e4567-e89b-12d3-a456-426614174002'),
          logDate: new Date('2025-01-14'),
        }),
      ];

      vi.mocked(mockHabitLogRepository.findByUserId).mockResolvedValue(
        habitLogs
      );

      const query = {
        userId,
        limit: 10,
        offset: 0,
      };

      const result = await findHabitLogsUseCase.execute(query);

      expect(result).toEqual(habitLogs);
      expect(mockHabitLogRepository.findByUserId).toHaveBeenCalledWith({
        userId,
        habitId: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('should filter by habitId when provided', async () => {
      const habitLogs = [createMockHabitLog()];

      vi.mocked(mockHabitLogRepository.findByUserId).mockResolvedValue(
        habitLogs
      );

      const query = {
        userId,
        habitId,
        limit: 10,
        offset: 0,
      };

      const result = await findHabitLogsUseCase.execute(query);

      expect(result).toEqual(habitLogs);
      expect(mockHabitLogRepository.findByUserId).toHaveBeenCalledWith({
        userId,
        habitId,
        startDate: undefined,
        endDate: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const habitLogs = [createMockHabitLog()];

      vi.mocked(mockHabitLogRepository.findByUserId).mockResolvedValue(
        habitLogs
      );

      const query = {
        userId,
        startDate,
        endDate,
        limit: 10,
        offset: 0,
      };

      const result = await findHabitLogsUseCase.execute(query);

      expect(result).toEqual(habitLogs);
      expect(mockHabitLogRepository.findByUserId).toHaveBeenCalledWith({
        userId,
        habitId: undefined,
        startDate,
        endDate,
        limit: 10,
        offset: 0,
      });
    });

    it('should return empty array when no logs exist', async () => {
      vi.mocked(mockHabitLogRepository.findByUserId).mockResolvedValue([]);

      const query = {
        userId,
        limit: 10,
        offset: 0,
      };

      const result = await findHabitLogsUseCase.execute(query);

      expect(result).toEqual([]);
    });

    it('should apply pagination correctly', async () => {
      const habitLogs = [createMockHabitLog()];

      vi.mocked(mockHabitLogRepository.findByUserId).mockResolvedValue(
        habitLogs
      );

      const query = {
        userId,
        limit: 5,
        offset: 10,
      };

      await findHabitLogsUseCase.execute(query);

      expect(mockHabitLogRepository.findByUserId).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 10,
        })
      );
    });

    it('should filter by all parameters when provided', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const habitLogs = [createMockHabitLog()];

      vi.mocked(mockHabitLogRepository.findByUserId).mockResolvedValue(
        habitLogs
      );

      const query = {
        userId,
        habitId,
        startDate,
        endDate,
        limit: 20,
        offset: 5,
      };

      const result = await findHabitLogsUseCase.execute(query);

      expect(result).toEqual(habitLogs);
      expect(mockHabitLogRepository.findByUserId).toHaveBeenCalledWith({
        userId,
        habitId,
        startDate,
        endDate,
        limit: 20,
        offset: 5,
      });
    });
  });
});
