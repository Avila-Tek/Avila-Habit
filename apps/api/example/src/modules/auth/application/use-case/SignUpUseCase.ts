import { NewUserEntity } from '../../domain/entities/NewUserEntity';
import { SessionEntity } from '../../domain/entities/SessionEntity';
import { Password } from '../../domain/value-objects/Password';
import { PasswordHasher } from '../ports/PasswordHasher';
import { SessionRepository } from '../ports/SessionRepository';
import { TokenHandler } from '../ports/TokenHandler';
import { UserService } from '../ports/UserService';

interface SignUpUseCaseInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class SignUpUseCase {
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

  async execute(input: SignUpUseCaseInput): Promise<{ token: string }> {
    const { firstName, lastName, email, password } = input;

    const conflictingUser = await this.userService.findByEmail(email);
    if (conflictingUser) throw new Error('Email already in use');

    const newUser = NewUserEntity.create({
      firstName,
      lastName,
      email,
      password,
    });

    const hashedPassword = await this.passwordHasher.hash(password);
    newUser.password = Password.fromHash(hashedPassword);

    const user = await this.userService.create(newUser);
    if (!user) throw new Error('Error creating user');

    const token = await this.tokenHandler.generate({ userId: user.id }, '1h');
    const session = SessionEntity.create({ userId: user.id, token });
    await this.sessionRepository.save(session);

    return { token };
  }
}
