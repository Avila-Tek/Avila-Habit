export interface CheckHabitLimitResult {
  allowed: boolean;
  current: number;
  limit: number | null;
}

export interface IHabitLimitChecker {
  checkLimit(userId: string): Promise<CheckHabitLimitResult>;
}
