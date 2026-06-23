import { SessionRepository } from '../../application/ports/SessionRepository';
import { SessionEntity } from '../../domain/entities/SessionEntity';

export class SessionAmazingDBRepository implements SessionRepository {
  save(session: SessionEntity): Promise<SessionEntity> {
    return new Promise((resolve) =>
      resolve(
        SessionEntity.create({
          id: 'mocked-session-id',
          token: session.token,
          userId: session.userId,
          createdAt: new Date(),
        })
      )
    );
  }
  getByToken(token: string): Promise<SessionEntity> {
    return new Promise((resolve) =>
      resolve(
        SessionEntity.create({
          id: 'mocked-session-id',
          token,
          userId: 'mocked-user-id',
          createdAt: new Date(),
        })
      )
    );
  }

  delete(token: string): Promise<void> {
    return new Promise(() => true);
  }
}
