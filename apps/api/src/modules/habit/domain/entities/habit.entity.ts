import {
  HabitGoal,
  HabitId,
  HabitReminder,
  HabitSchedule,
  HabitStatus,
  TimeOfDay,
} from '../value-objects';

export interface HabitProps {
  id: HabitId;
  userId: string;
  name: string;
  description?: string;
  schedule: HabitSchedule;
  goal: HabitGoal;
  timeOfDay: TimeOfDay;
  reminder: HabitReminder;
  status: HabitStatus;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitProps {
  id: HabitId;
  userId: string;
  name: string;
  description?: string;
  schedule: HabitSchedule;
  goal: HabitGoal;
  timeOfDay: TimeOfDay;
  reminder: HabitReminder;
  startDate?: Date;
  endDate?: Date;
}

export class Habit {
  private _status: HabitStatus;
  private _isActive: boolean;
  private _schedule: HabitSchedule;
  private _goal: HabitGoal;
  private _reminder: HabitReminder;
  private _timeOfDay: TimeOfDay;
  private _name: string;
  private _description?: string;
  private _startDate?: Date;
  private _endDate?: Date;
  private _updatedAt: Date;

  private constructor(private readonly props: HabitProps) {
    this._status = props.status;
    this._isActive = props.isActive;
    this._schedule = props.schedule;
    this._goal = props.goal;
    this._reminder = props.reminder;
    this._timeOfDay = props.timeOfDay;
    this._name = props.name;
    this._description = props.description;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateHabitProps): Habit {
    const now = new Date();
    return new Habit({
      ...props,
      status: HabitStatus.active(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: HabitProps): Habit {
    return new Habit(props);
  }

  get id(): HabitId {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get schedule(): HabitSchedule {
    return this._schedule;
  }

  get goal(): HabitGoal {
    return this._goal;
  }

  get timeOfDay(): TimeOfDay {
    return this._timeOfDay;
  }

  get reminder(): HabitReminder {
    return this._reminder;
  }

  get status(): HabitStatus {
    return this._status;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get startDate(): Date | undefined {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private ensureCanModify(): void {
    if (!this._isActive) {
      throw new Error('Cannot perform operation on a deleted habit');
    }
    if (this._status.isBlocked()) {
      throw new Error('Cannot perform operation on a blocked habit');
    }
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  pause(): void {
    this.ensureCanModify();

    if (this._status.isPaused()) {
      throw new Error('Habit is already paused');
    }

    this._status = HabitStatus.paused();
    this.touch();
  }

  reactivate(): void {
    if (!this._isActive) {
      throw new Error('Cannot perform operation on a deleted habit');
    }

    if (!this._status.isPaused()) {
      throw new Error('Can only reactivate a paused habit');
    }

    this._status = HabitStatus.active();
    this.touch();
  }

  block(): void {
    if (!this._isActive) {
      throw new Error('Cannot perform operation on a deleted habit');
    }

    if (this._status.isBlocked()) {
      throw new Error('Habit is already blocked');
    }

    this._status = HabitStatus.blocked();
    this.touch();
  }

  unblock(): void {
    if (!this._isActive) {
      throw new Error('Cannot perform operation on a deleted habit');
    }

    if (!this._status.isBlocked()) {
      throw new Error('Can only unblock a blocked habit');
    }

    this._status = HabitStatus.active();
    this.touch();
  }

  softDelete(): void {
    if (!this._isActive) {
      throw new Error('Habit is already deleted');
    }
    this._isActive = false;
    this.touch();
  }

  restore(): void {
    if (this._isActive) {
      throw new Error('Habit is not deleted');
    }
    this._isActive = true;
    this.touch();
  }

  updateName(name: string): void {
    this.ensureCanModify();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Name must be a non-empty string');
    }

    this._name = name.trim();
    this.touch();
  }

  updateDescription(description?: string): void {
    this.ensureCanModify();
    this._description = description?.trim();
    this.touch();
  }

  updateSchedule(schedule: HabitSchedule): void {
    this.ensureCanModify();
    this._schedule = schedule;
    this.touch();
  }

  updateGoal(goal: HabitGoal): void {
    this.ensureCanModify();
    this._goal = goal;
    this.touch();
  }

  updateTimeOfDay(timeOfDay: TimeOfDay): void {
    this.ensureCanModify();
    this._timeOfDay = timeOfDay;
    this.touch();
  }

  updateReminder(reminder: HabitReminder): void {
    this.ensureCanModify();
    this._reminder = reminder;
    this.touch();
  }

  updateDateRange(startDate?: Date, endDate?: Date): void {
    this.ensureCanModify();

    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    this._startDate = startDate;
    this._endDate = endDate;
    this.touch();
  }

  isWithinDateRange(date: Date): boolean {
    if (this._startDate && date < this._startDate) {
      return false;
    }
    if (this._endDate && date > this._endDate) {
      return false;
    }
    return true;
  }

  isScheduledFor(date: Date): boolean {
    if (!this.isWithinDateRange(date)) {
      return false;
    }
    return this._schedule.isScheduledForDay(date.getDay());
  }
}
