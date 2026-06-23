interface CreateNewSessionAttributes {
  id?: string;
  userId: string;
  token: string;
  createdAt?: Date;
  expiresAt?: Date;
}

export class SessionEntity {
  public readonly id: string | null;
  public userId: string;
  public token: string;
  public createdAt: Date | null;
  public expiresAt: Date | null;

  private constructor(attributes: CreateNewSessionAttributes) {
    this.id = attributes.id ?? null;
    this.userId = attributes.userId;
    this.token = attributes.token;
    this.createdAt = attributes.createdAt ?? new Date();
    this.expiresAt = attributes.expiresAt ?? new Date();
  }

  static create(attributes: CreateNewSessionAttributes) {
    return new SessionEntity(attributes);
  }
}
