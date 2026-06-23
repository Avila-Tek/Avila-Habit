import type { TGoalPeriod } from '@repo/schemas';
import type {
  HabitStatusValue,
  TimeOfDayValue,
} from '../../domain/value-objects';

export interface GetHabitsForDateQuery {
  userId: string;
  date: Date;
  timeOfDay?: TimeOfDayValue;
  day?: number;
  completed?: boolean;
  status?: HabitStatusValue;
}

export interface HabitProgress {
  unit: string;
  period: TGoalPeriod;
  target: number;
  current: number;
  completed: boolean;
}

export interface HabitForDate {
  id: string;
  timeOfDay: TimeOfDayValue;
  status: HabitStatusValue;
  startDate?: Date;
  endDate?: Date;
  progress: HabitProgress;
}

export interface GetHabitsForDateResult {
  today: HabitForDate[];
  week: HabitForDate[];
}

export interface IGetHabitsForDateUseCase {
  execute(query: GetHabitsForDateQuery): Promise<GetHabitsForDateResult>;
}
