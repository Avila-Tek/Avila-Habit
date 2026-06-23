import { FastifyReply, FastifyRequest } from 'fastify';
import { CurrentUserUseCase } from '../../application/use-case/CurrentUserUsaCase';
import { SignInUseCase } from '../../application/use-case/SignInUseCase';
import { SignUpUseCase } from '../../application/use-case/SignUpUseCase';

export class AuthController {
  private useCases: {
    signIn: SignInUseCase;
    signUp: SignUpUseCase;
    currentUser: CurrentUserUseCase;
  };

  constructor(useCases: {
    signIn: SignInUseCase;
    signUp: SignUpUseCase;
    currentUser: CurrentUserUseCase;
  }) {
    this.useCases = useCases;
  }

  async signIn(
    request: FastifyRequest<{
      Body: { email: string; password: string };
    }>,
    reply: FastifyReply
  ): Promise<any> {
    const { email, password } = request.body;
    const result = await this.useCases.signIn.execute({ email, password });
    return reply.send(result);
  }

  async signUp(
    request: FastifyRequest<{
      Body: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      };
    }>,
    reply: FastifyReply
  ): Promise<any> {
    const result = await this.useCases.signUp.execute(request.body);
    return reply.send(result);
  }

  async currentUser(
    request: FastifyRequest<{
      Headers: { authorization: string };
    }>,
    reply: FastifyReply
  ): Promise<any> {
    if (!request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const result = await this.useCases.currentUser.execute({
      token: request.token,
    });
    return reply.send(result);
  }
}
