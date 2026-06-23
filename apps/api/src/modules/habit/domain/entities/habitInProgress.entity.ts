import { Habit } from './habit.entity';

interface Log {
  value: number;
  completed: boolean;
}

export interface HabitInProgress {
  habit: Habit;
  log: Log | null;
}
