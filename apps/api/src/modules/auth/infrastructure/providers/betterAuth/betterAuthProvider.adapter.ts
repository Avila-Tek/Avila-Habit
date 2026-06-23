import type {
  IAuthProvider,
  ResetPasswordData,
  SignInData,
  SignInResult,
  SignUpData,
  SignUpResult,
  VerifyEmailCallbackResult,
  VerifyOtpData,
  VerifyTokenResult,
} from '@/modules/auth/application/ports/authProvider.port';
import {
  BetterAuthError,
  EmailNotConfirmedError,
  InvalidCredentialsError,
  InvalidOtpError,
} from '@/modules/auth/domain/errors/auth.errors';
import type { BetterAuthInstance } from './betterAuthInstance';

export class BetterAuthProvider implements IAuthProvider {
  constructor(private readonly auth: BetterAuthInstance) {}

  private buildFullName(firstName?: string, lastName?: string): string {
    return [firstName, lastName].filter(Boolean).join(' ').trim();
  }

  private parseFullName(fullName?: string | null): {
    firstName?: string;
    lastName?: string;
  } {
    if (!fullName) return {};
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return {};
    if (parts.length === 1) return { firstName: parts[0] };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  async signUp(data: SignUpData): Promise<SignUpResult> {
    try {
      const fullName = this.buildFullName(data.firstName, data.lastName);
      const result = await this.auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: fullName,
        },
      });

      if (!result) {
        return {
          user: null,
          requiresEmailConfirmation: true,
        };
      }

      // Send verification OTP after successful signup
      if (result.user && !result.user.emailVerified) {
        await this.auth.api.sendVerificationOTP({
          body: {
            email: data.email,
            type: 'email-verification',
          },
        });
      }

      const parsedName = this.parseFullName(result.user?.name);

      return {
        user: result.user
          ? {
              id: result.user.id,
              email: result.user.email,
              firstName: parsedName.firstName,
              lastName: parsedName.lastName,
              emailConfirmedAt: result.user.emailVerified
                ? new Date()
                : undefined,
            }
          : null,
        requiresEmailConfirmation: !result.user?.emailVerified,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('Sign up failed');
    }
  }

  async signIn(data: SignInData): Promise<SignInResult> {
    try {
      const result = await this.auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
      });

      if (!result || !result.user) {
        throw new InvalidCredentialsError();
      }

      if (!result.user.emailVerified) {
        throw new EmailNotConfirmedError();
      }

      if (!result.token) {
        throw new BetterAuthError('No session token returned');
      }

      const parsedName = this.parseFullName(result.user.name);

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          emailConfirmedAt: result.user.emailVerified ? new Date() : undefined,
        },
        session: {
          accessToken: result.token,
          refreshToken: result.token,
          expiresAt: undefined,
        },
      };
    } catch (error) {
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof EmailNotConfirmedError
      ) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials')) {
          throw new InvalidCredentialsError();
        }
        if (error.message.includes('email not verified')) {
          throw new EmailNotConfirmedError();
        }
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('Sign in failed');
    }
  }

  async signOut(accessToken: string): Promise<void> {
    try {
      await this.auth.api.signOut({
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('Sign out failed');
    }
  }

  async verifyToken(accessToken: string): Promise<VerifyTokenResult | null> {
    try {
      const session = await this.auth.api.getSession({
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (!session || !session.user) {
        return null;
      }

      return {
        userId: session.user.id,
        email: session.user.email,
      };
    } catch {
      return null;
    }
  }

  async verifyEmailCallback(
    tokenHash: string,
    type: string,
    email?: string
  ): Promise<VerifyEmailCallbackResult> {
    if (email) {
      return this.verifyOtp({ email, otp: tokenHash });
    }

    throw new BetterAuthError(
      'Better Auth requires email for OTP verification. Use verifyOtp instead.'
    );
  }

  async sendOtp(email: string): Promise<void> {
    try {
      await this.auth.api.sendVerificationOTP({
        body: {
          email,
          type: 'email-verification',
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('Failed to send OTP');
    }
  }

  async verifyOtp(data: VerifyOtpData): Promise<VerifyEmailCallbackResult> {
    try {
      const result = await this.auth.api.verifyEmailOTP({
        body: {
          email: data.email,
          otp: data.otp,
        },
      });

      if (!result || !result.user) {
        throw new InvalidOtpError();
      }

      const token = result.token ?? '';
      const parsedName = this.parseFullName(result.user.name);

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          emailConfirmedAt: new Date(),
        },
        session: {
          accessToken: token,
          refreshToken: token,
          expiresAt: undefined,
        },
      };
    } catch (error) {
      if (error instanceof InvalidOtpError) {
        throw error;
      }
      if (error instanceof Error) {
        if (
          error.message.includes('Invalid') ||
          error.message.includes('expired')
        ) {
          throw new InvalidOtpError();
        }
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('OTP verification failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.auth.api.sendVerificationOTP({
        body: {
          email,
          type: 'forget-password',
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('Failed to send password reset OTP');
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await this.auth.api.resetPasswordEmailOTP({
        body: {
          email: data.email,
          otp: data.otp,
          password: data.newPassword,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('Invalid') ||
          error.message.includes('expired')
        ) {
          throw new InvalidOtpError();
        }
        throw new BetterAuthError(error.message);
      }
      throw new BetterAuthError('Password reset failed');
    }
  }
}
