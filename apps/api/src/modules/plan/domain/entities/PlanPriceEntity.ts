interface PlanPriceEntityProps {
  id: string;
  planId: string;
  currency: string;
  interval: string;
  amountCents: number;
  trialDays: number;
  isActive: boolean;
  stripePriceId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PlanPriceEntity {
  public readonly id: string;
  public readonly planId: string;
  public currency: string;
  public interval: string;
  public amountCents: number;
  public trialDays: number;
  public isActive: boolean;
  public stripePriceId: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  private constructor(props: PlanPriceEntityProps) {
    this.id = props.id;
    this.planId = props.planId;
    this.currency = props.currency;
    this.interval = props.interval;
    this.amountCents = props.amountCents;
    this.trialDays = props.trialDays;
    this.isActive = props.isActive;
    this.stripePriceId = props.stripePriceId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: PlanPriceEntityProps): PlanPriceEntity {
    return new PlanPriceEntity(props);
  }
}
