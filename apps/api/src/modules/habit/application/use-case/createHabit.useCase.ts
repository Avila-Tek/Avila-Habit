import type { Habit } from '../../domain/entities/habit.entity';
import { HabitLimitExceededError } from '../../domain/errors/habit.errors';
import type {
  CreateHabitCommand,
  ICreateHabitUseCase,
} from '../ports/createHabit.port';
import type { IHabitLimitChecker } from '../ports/habitLimitChecker.port';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type { IHabitSearchProvider } from '../ports/habitSearchProvider.port';

export class CreateHabitUseCase implements ICreateHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly habitLimitChecker: IHabitLimitChecker,
    private readonly searchProvider?: IHabitSearchProvider | null
  ) {}

  async execute(command: CreateHabitCommand): Promise<Habit> {
    // Check if user can create more habits
    const limitCheck = await this.habitLimitChecker.checkLimit(command.userId);

    if (!limitCheck.allowed) {
      throw new HabitLimitExceededError(
        limitCheck.current,
        limitCheck.limit ?? 0
      );
    }

    const habit = await this.habitRepository.create({
      userId: command.userId,
      name: command.name,
      description: command.description,
      schedule: {
        type: command.schedule.type,
        daysOfWeek: command.schedule.daysOfWeek,
        weeklyDay: command.schedule.weeklyDay,
        weeklyFlexible: command.schedule.weeklyFlexible ?? false,
      },
      goal: {
        unit: command.goal.unit,
        period: command.goal.period,
        target: command.goal.target,
      },
      timeOfDay: command.timeOfDay,
      reminder: command.reminder,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    if (this.searchProvider) {
      try {
        await this.searchProvider.indexHabit(habit);
      } catch (err) {
        console.error('Failed to index habit in search:', err);
      }
    }

    return habit;
  }
}
