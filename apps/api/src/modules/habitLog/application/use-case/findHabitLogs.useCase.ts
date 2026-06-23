import type { HabitLog } from '../../domain/entities/habitLog.entity';
import type {
  FindHabitLogsQuery,
  IFindHabitLogsUseCase,
} from '../ports/findHabitLogs.port';
import type { IHabitLogRepository } from '../ports/habitLogRepository.port';

export class FindHabitLogsUseCase implements IFindHabitLogsUseCase {
  constructor(private readonly habitLogRepository: IHabitLogRepository) {}

  async execute(query: FindHabitLogsQuery): Promise<HabitLog[]> {
    const habitLogs = await this.habitLogRepository.findByUserId({
      userId: query.userId,
      habitId: query.habitId,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit,
      offset: query.offset,
    });

    return habitLogs;
  }
}
