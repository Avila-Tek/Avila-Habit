import type { TPaginationInput } from '@repo/schemas';
import { Habit } from '../../domain/entities/habit.entity';
import { HabitInProgress } from '../../domain/entities/habitInProgress.entity';
import type {
  HabitGoalProps,
  HabitReminderProps,
  HabitScheduleProps,
  HabitStatusValue,
  TimeOfDayValue,
} from '../../domain/value-objects';

export interface HabitFindInput {
  id?: string;
  userId?: string;
  includeDeleted?: boolean;
}

export interface CreateHabitInput {
  userId: string;
  name: string;
  description?: string;
  schedule: HabitScheduleProps;
  goal: HabitGoalProps;
  timeOfDay: TimeOfDayValue;
  reminder: HabitReminderProps;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  schedule?: HabitScheduleProps;
  goal?: HabitGoalProps;
  timeOfDay?: TimeOfDayValue;
  reminder?: HabitReminderProps;
  startDate?: Date;
  endDate?: Date;
  status?: HabitStatusValue;
  isActive?: boolean;
}

export interface FindHabitsForDateFilters {
  userId: string;
  date: Date;
  timeOfDay?: TimeOfDayValue;
  day?: number;
  completed?: boolean;
  status?: HabitStatusValue;
}

export interface IHabitRepository {
  findById(id: string, includeDeleted?: boolean): Promise<Habit | null>;
  findByUserId(
    userId: string,
    params: TPaginationInput & { includeDeleted?: boolean }
  ): Promise<Habit[]>;
  count(userId: string, includeDeleted?: boolean): Promise<number>;
  exists(id: string): Promise<boolean>;
  create(data: CreateHabitInput): Promise<Habit>;
  update(habit: Habit): Promise<Habit>;
  hardDelete(id: string): Promise<void>;
  findHabitsWithLogsForDate(
    filters: FindHabitsForDateFilters
  ): Promise<HabitInProgress[]>;
}
