export class HabitPausedEvent {
  constructor(
    public readonly habitId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
