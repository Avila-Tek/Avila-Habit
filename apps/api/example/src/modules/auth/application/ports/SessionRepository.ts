import { SessionEntity } from '@/modules/auth/domain/entities/SessionEntity';

export interface SessionRepository {
  save(session: SessionEntity): Promise<SessionEntity>;
  getByToken(token: string): Promise<SessionEntity>;
  delete(token: string): Promise<void>;
}
