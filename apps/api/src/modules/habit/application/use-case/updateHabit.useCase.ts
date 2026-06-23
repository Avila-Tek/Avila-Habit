import type { Habit } from '../../domain/entities/habit.entity';
import { HabitNotFoundError } from '../../domain/errors/habit.errors';
import {
  HabitGoal,
  HabitReminder,
  HabitSchedule,
  TimeOfDay,
} from '../../domain/value-objects';
import type { IHabitRepository } from '../ports/habitRepository.port';
import type { IHabitSearchProvider } from '../ports/habitSearchProvider.port';
import type {
  IUpdateHabitUseCase,
  UpdateHabitCommand,
} from '../ports/updateHabit.port';

export class UpdateHabitUseCase implements IUpdateHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly searchProvider?: IHabitSearchProvider | null
  ) {}

  async execute(command: UpdateHabitCommand): Promise<Habit> {
    const habit = await this.habitRepository.findById(command.id);

    if (!habit || habit.userId !== command.userId) {
      throw new HabitNotFoundError(command.id);
    }

    if (command.name !== undefined) {
      habit.updateName(command.name);
    }

    if (command.description !== undefined) {
      habit.updateDescription(command.description);
    }

    if (command.schedule !== undefined) {
      const schedule = HabitSchedule.create({
        type: command.schedule.type,
        daysOfWeek: command.schedule.daysOfWeek,
        weeklyDay: command.schedule.weeklyDay,
        weeklyFlexible: command.schedule.weeklyFlexible ?? false,
      });
      habit.updateSchedule(schedule);
    }

    if (command.goal !== undefined) {
      const goal = HabitGoal.create({
        unit: command.goal.unit,
        period: command.goal.period,
        target: command.goal.target,
      });
      habit.updateGoal(goal);
    }

    if (command.timeOfDay !== undefined) {
      const timeOfDay = TimeOfDay.create(command.timeOfDay);
      habit.updateTimeOfDay(timeOfDay);
    }

    if (command.reminder !== undefined) {
      const reminder = HabitReminder.create(command.reminder);
      habit.updateReminder(reminder);
    }

    if (command.startDate !== undefined || command.endDate !== undefined) {
      habit.updateDateRange(command.startDate, command.endDate);
    }

    const updatedHabit = await this.habitRepository.update(habit);

    if (this.searchProvider) {
      try {
        await this.searchProvider.updateHabitIndex(updatedHabit);
      } catch (err) {
        console.error('Failed to update habit in search index:', err);
      }
    }

    return updatedHabit;
  }
}
