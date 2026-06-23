import type { Habit } from '../../domain/entities/habit.entity';
import type {
  GoalPeriod,
  HabitReminderProps,
  ScheduleType,
  TimeOfDayValue,
} from '../../domain/value-objects';

export interface UpdateHabitCommand {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  schedule?: {
    type: ScheduleType;
    daysOfWeek?: number[];
    weeklyDay?: number;
    weeklyFlexible?: boolean;
  };
  goal?: {
    unit: string;
    period: GoalPeriod;
    target: number;
  };
  timeOfDay?: TimeOfDayValue;
  reminder?: HabitReminderProps;
  startDate?: Date;
  endDate?: Date;
}

export interface IUpdateHabitUseCase {
  execute(command: UpdateHabitCommand): Promise<Habit>;
}
