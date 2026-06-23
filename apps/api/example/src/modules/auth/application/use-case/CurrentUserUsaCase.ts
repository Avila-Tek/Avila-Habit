import { SessionRepository } from '../ports/SessionRepository';
import { TokenHandler } from '../ports/TokenHandler';
import { UserService } from '../ports/UserService';

interface CurrentUserUseCaseInput {
  token: string;
}

export class CurrentUserUseCase {
  private userService: UserService;
  private sessionRepository: SessionRepository;
  private tokenHandler: TokenHandler;

  constructor(
    userService: UserService,
    sessionRepository: SessionRepository,
    tokenHandler: TokenHandler
  ) {
    this.userService = userService;
    this.sessionRepository = sessionRepository;
    this.tokenHandler = tokenHandler;
  }

  async execute(input: CurrentUserUseCaseInput) {
    const { token } = input;

    const payload = await this.tokenHandler.verify(token);

    const [user, session] = await Promise.all([
      this.userService.findById(payload.userId),
      this.sessionRepository.getByToken(token),
    ]);

    if (!user) throw new Error('Invalid credentials');
    if (!session) throw new Error('Invalid credentials');

    return user;
  }
}
