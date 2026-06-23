import type { TSearchApiKeyResponse } from '@repo/schemas';
import type { Habit } from '../../domain/entities/habit.entity';

export interface IHabitSearchProvider {
  indexHabit(habit: Habit): Promise<void>;
  updateHabitIndex(habit: Habit): Promise<void>;
  removeFromIndex(habitId: string): Promise<void>;
  generateSecuredApiKey(userId: string): TSearchApiKeyResponse;
}
