interface PlanEntityProps {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isFree: boolean;
  displayOrder: number;
  limitsHabitsMax: number | null;
  limitsReportsEnabled: boolean;
  limitsHistoryDays: number | null;
  limitsRemindersEnabled: boolean;
  stripeProductId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PlanEntity {
  public readonly id: string;
  public readonly key: string;
  public name: string;
  public description: string | null;
  public isActive: boolean;
  public isFree: boolean;
  public displayOrder: number;
  public limitsHabitsMax: number | null;
  public limitsReportsEnabled: boolean;
  public limitsHistoryDays: number | null;
  public limitsRemindersEnabled: boolean;
  public stripeProductId: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  private constructor(props: PlanEntityProps) {
    this.id = props.id;
    this.key = props.key;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive;
    this.isFree = props.isFree;
    this.displayOrder = props.displayOrder;
    this.limitsHabitsMax = props.limitsHabitsMax;
    this.limitsReportsEnabled = props.limitsReportsEnabled;
    this.limitsHistoryDays = props.limitsHistoryDays;
    this.limitsRemindersEnabled = props.limitsRemindersEnabled;
    this.stripeProductId = props.stripeProductId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: PlanEntityProps): PlanEntity {
    return new PlanEntity(props);
  }
}
