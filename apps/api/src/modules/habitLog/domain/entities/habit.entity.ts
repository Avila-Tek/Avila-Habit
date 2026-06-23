import { TGoalPeriod } from '@repo/schemas';

export interface HabitGoal {
  period: TGoalPeriod;
  target: number;
}

export interface Habit {
  isActive: boolean;
  isPaused: boolean;
  isBlocked: boolean;
  goal: HabitGoal;
}
