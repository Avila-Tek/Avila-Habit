import { Habit } from '../../domain/entities/habit.entity';

export interface IFindByIdInput {
  id: string;
  userId?: string;
}

export interface IFindOneHabitProxy {
  /**
   * find one habit by id
   * @throws not found OR userId do not match
   */
  findById: (input: IFindByIdInput) => Promise<Habit>;
}
