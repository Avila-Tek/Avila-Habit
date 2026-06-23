import type {
  TEmailCallbackQuery,
  TForgotPasswordInput,
  TGoogleAuthInput,
  TResetPasswordInput,
  TSendOtpInput,
  TSignInInput,
  TSignUpInput,
  TVerifyOtpInput,
} from '@repo/schemas';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IGetCurrentUserUseCase } from '@/modules/auth/application/ports/getCurrentUser.port';
import type { IRoleRepository } from '@/modules/auth/application/ports/roleRepository.port';
import type { ISignInUseCase } from '@/modules/auth/application/ports/signIn.port';
import type { ISignOutUseCase } from '@/modules/auth/application/ports/signOut.port';
import type { ISignUpUseCase } from '@/modules/auth/application/ports/signUp.port';
import type { IVerifyEmailCallbackUseCase } from '@/modules/auth/application/ports/verifyEmailCallback.port';
import type { IVerifyOtpUseCase } from '@/modules/auth/application/ports/verifyOtp.port';
import { getAuthorizationToken } from '@/utils/headers';
import { AuthMapper } from '../mappers/auth.mapper';

export class AuthController {
  constructor(
    private readonly signInUseCase: ISignInUseCase,
    private readonly signUpUseCase: ISignUpUseCase,
    private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
    private readonly signOutUseCase: ISignOutUseCase,
    private readonly verifyEmailCallbackUseCase: IVerifyEmailCallbackUseCase,
    private readonly verifyOtpUseCase: IVerifyOtpUseCase,
    private readonly roleRepository: IRoleRepository
  ) {
    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.currentUser = this.currentUser.bind(this);
    this.signOut = this.signOut.bind(this);
    this.emailCallback = this.emailCallback.bind(this);
    this.sendOtp = this.sendOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
  }

  async signIn(
    request: FastifyRequest<{ Body: TSignInInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.signInUseCase.execute({
      email: request.body.email,
      password: request.body.password,
    });

    reply.status(200).send({
      success: true,
      data: AuthMapper.toSignInResponse(
        result.user,
        result.accessToken,
        result.refreshToken
      ),
    });
  }

  async signUp(
    request: FastifyRequest<{ Body: TSignUpInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.signUpUseCase.execute({
      email: request.body.email,
      password: request.body.password,
      rePassword: request.body.rePassword,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
    });

    reply.status(201).send({
      success: true,
      data: AuthMapper.toSignUpResponse(
        result.user,
        result.requiresEmailConfirmation
      ),
    });
  }

  async currentUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const accessToken = getAuthorizationToken(request);

    const user = await this.getCurrentUserUseCase.execute({ accessToken });

    // Get subscription from plan module
    let subscription = null;
    const server = request.server as any;
    if (
      server.plan &&
      server.plan.useCases &&
      server.plan.useCases.getUserSubscription
    ) {
      subscription = await server.plan.useCases.getUserSubscription.execute({
        userId: user.id.value,
      });
    }

    // Get user role with permissions
    let role = null;
    if (user.roleId) {
      role = await this.roleRepository.findById(user.roleId);
    }

    reply.status(200).send({
      success: true,
      data: AuthMapper.toCurrentUserResponse(user, subscription, role),
    });
  }

  async signOut(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const accessToken = getAuthorizationToken(request);

    await this.signOutUseCase.execute({ accessToken });

    reply.status(200).send({
      success: true,
      data: null,
    });
  }

  async emailCallback(
    request: FastifyRequest<{ Querystring: TEmailCallbackQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.verifyEmailCallbackUseCase.execute({
      tokenHash: request.query.token_hash,
      type: request.query.type,
    });

    reply.status(200).send({
      success: true,
      data: AuthMapper.toEmailCallbackResponse(
        result.user,
        result.accessToken,
        result.refreshToken
      ),
    });
  }

  async sendOtp(
    request: FastifyRequest<{ Body: TSendOtpInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const authProvider = request.server.authProvider;
    if (!authProvider.sendOtp) {
      reply.status(501).send({
        success: false,
        error: 'OTP not supported by current auth provider',
      });
      return;
    }

    await authProvider.sendOtp(request.body.email);

    reply.status(200).send({
      success: true,
    });
  }

  async verifyOtp(
    request: FastifyRequest<{ Body: TVerifyOtpInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.verifyOtpUseCase.execute({
      email: request.body.email,
      otp: request.body.otp,
    });

    reply.status(200).send({
      success: true,
      data: AuthMapper.toEmailCallbackResponse(
        result.user,
        result.accessToken,
        result.refreshToken
      ),
    });
  }

  async forgotPassword(
    request: FastifyRequest<{ Body: TForgotPasswordInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const authProvider = request.server.authProvider;
    if (!authProvider.forgotPassword) {
      reply.status(501).send({
        success: false,
        error: 'Forgot password not supported by current auth provider',
      });
      return;
    }

    await authProvider.forgotPassword(request.body.email);

    reply.status(200).send({
      success: true,
    });
  }

  async resetPassword(
    request: FastifyRequest<{ Body: TResetPasswordInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const authProvider = request.server.authProvider;
    if (!authProvider.resetPassword) {
      reply.status(501).send({
        success: false,
        error: 'Reset password not supported by current auth provider',
      });
      return;
    }

    await authProvider.resetPassword({
      email: request.body.email,
      otp: request.body.otp,
      newPassword: request.body.newPassword,
    });

    reply.status(200).send({
      success: true,
    });
  }

  async googleAuth(
    request: FastifyRequest<{ Querystring: TGoogleAuthInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const callbackUrl =
      request.query.callbackUrl ?? 'http://localhost:3001/auth/callback';

    // Get Better Auth instance and call signInSocial with proper context
    const betterAuth = request.server.betterAuthInstance;
    if (!betterAuth) {
      reply.status(501).send({
        success: false,
        error: 'Google OAuth not available',
      });
      return;
    }

    // Call Better Auth API to get OAuth URL - this sets cookies on the response
    const result = await betterAuth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: callbackUrl,
      },
      headers: request.headers as Record<string, string>,
      asResponse: true,
    });

    // Copy cookies from Better Auth response to our response
    const setCookieHeader = result.headers.get('set-cookie');
    if (setCookieHeader) {
      reply.header('set-cookie', setCookieHeader);
    }

    const data = (await result.json()) as { url?: string };
    if (data.url) {
      reply.redirect(data.url);
    } else {
      reply.status(500).send({
        success: false,
        error: 'Failed to get OAuth URL',
      });
    }
  }
}
