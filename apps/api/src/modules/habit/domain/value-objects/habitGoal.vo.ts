import { GOAL_PERIOD, goalPeriodValues, type TGoalPeriod } from '@repo/schemas';
import { InvalidGoalError } from '../errors/habit.errors';

export interface HabitGoalProps {
  unit: string;
  period: TGoalPeriod;
  target: number;
}

export class HabitGoal {
  private constructor(
    private readonly _unit: string,
    private readonly _period: TGoalPeriod,
    private readonly _target: number
  ) {}

  private static validateUnit(unit: string): void {
    if (!unit || typeof unit !== 'string') {
      throw new InvalidGoalError('Goal unit must be a non-empty string');
    }
  }

  private static validatePeriod(period: TGoalPeriod): void {
    if (!goalPeriodValues.includes(period)) {
      throw new InvalidGoalError(
        `Invalid goal period: ${period}. Must be one of: ${goalPeriodValues.join(', ')}`
      );
    }
  }

  private static validateTarget(target: number): void {
    if (!Number.isInteger(target) || target < 1) {
      throw new InvalidGoalError('Goal target must be a positive integer');
    }
  }

  private static validateProps(props: HabitGoalProps): void {
    HabitGoal.validateUnit(props.unit);
    HabitGoal.validatePeriod(props.period);
    HabitGoal.validateTarget(props.target);
  }

  static create(props: HabitGoalProps): HabitGoal {
    HabitGoal.validateProps(props);
    return new HabitGoal(props.unit, props.period, props.target);
  }

  static createDefault(): HabitGoal {
    return new HabitGoal('times', GOAL_PERIOD.DAY, 1);
  }

  get unit(): string {
    return this._unit;
  }

  get period(): TGoalPeriod {
    return this._period;
  }

  get target(): number {
    return this._target;
  }

  equals(other: HabitGoal): boolean {
    return (
      this._unit === other._unit &&
      this._period === other._period &&
      this._target === other._target
    );
  }

  toObject(): HabitGoalProps {
    return {
      unit: this._unit,
      period: this._period,
      target: this._target,
    };
  }
}
