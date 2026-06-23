import type { TPageInfo, TPaginationInput } from '@repo/schemas';
import type { Habit } from '../../domain/entities/habit.entity';

export interface FindHabitsQuery extends TPaginationInput {
  userId: string;
  includeDeleted?: boolean;
}

export interface FindHabitsResult {
  items: Habit[];
  pageInfo: TPageInfo;
}

export interface IFindHabitsUseCase {
  execute(query: FindHabitsQuery): Promise<FindHabitsResult>;
}
