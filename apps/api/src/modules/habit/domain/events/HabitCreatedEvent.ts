export class HabitCreatedEvent {
  constructor(
    public readonly habitId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
