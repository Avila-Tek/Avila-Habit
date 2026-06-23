import { SessionEntity } from '../../domain/entities/SessionEntity';
import { PasswordHasher } from '../ports/PasswordHasher';
import { SessionRepository } from '../ports/SessionRepository';
import { TokenHandler } from '../ports/TokenHandler';
import { UserService } from '../ports/UserService';

interface SignInUseCaseInput {
  email: string;
  password: string;
}

export class SignInUseCase {
  private userService: UserService;
  private passwordHasher: PasswordHasher;
  private sessionRepository: SessionRepository;
  private tokenHandler: TokenHandler;

  constructor(
    userService: UserService,
    passwordHasher: PasswordHasher,
    sessionRepository: SessionRepository,
    tokenHandler: TokenHandler
  ) {
    this.userService = userService;
    this.passwordHasher = passwordHasher;
    this.sessionRepository = sessionRepository;
    this.tokenHandler = tokenHandler;
  }

  async execute(input: SignInUseCaseInput): Promise<{ token: string }> {
    const { email, password } = input;

    const user = await this.userService.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const hashedPassword = await this.passwordHasher.hash(password);
    if (!user.password.equals(hashedPassword)) {
      throw new Error('Invalid credentials');
    }

    const token = await this.tokenHandler.generate({ userId: user.id }, '1h');
    const session = SessionEntity.create({ userId: user.id, token });
    await this.sessionRepository.save(session);
    return { token };
  }
}
