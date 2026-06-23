import type {
  FindHabitsQuery,
  FindHabitsResult,
  IFindHabitsUseCase,
} from '../ports/findHabits.port';
import type { IHabitRepository } from '../ports/habitRepository.port';

export class FindHabitsUseCase implements IFindHabitsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(query: FindHabitsQuery): Promise<FindHabitsResult> {
    const [habits, total] = await Promise.all([
      this.habitRepository.findByUserId(query.userId, {
        page: query.page,
        perPage: query.perPage,
        includeDeleted: query.includeDeleted,
      }),
      this.habitRepository.count(query.userId, query.includeDeleted),
    ]);

    const pageCount = Math.ceil(total / query.perPage);

    return {
      items: habits,
      pageInfo: {
        currentPage: query.page,
        perPage: query.perPage,
        itemCount: habits.length,
        pageCount,
        hasPreviousPage: query.page > 1,
        hasNextPage: query.page < pageCount,
      },
    };
  }
}
