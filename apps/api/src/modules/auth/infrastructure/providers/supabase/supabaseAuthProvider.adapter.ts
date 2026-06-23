import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  IAuthProvider,
  SignInData,
  SignInResult,
  SignUpData,
  SignUpResult,
  VerifyEmailCallbackResult,
  VerifyTokenResult,
} from '@/modules/auth/application/ports/authProvider.port';
import {
  EmailNotConfirmedError,
  InvalidCredentialsError,
  SupabaseAuthError,
} from '@/modules/auth/domain/errors/auth.errors';

export class SupabaseAuthProvider implements IAuthProvider {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async signUp(data: SignUpData): Promise<SignUpResult> {
    const { data: authData, error } = await this.client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (error) {
      throw new SupabaseAuthError(error.message);
    }

    if (!authData.user) {
      return {
        user: null,
        requiresEmailConfirmation: true,
      };
    }

    const requiresEmailConfirmation = !authData.user.email_confirmed_at;

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: authData.user.user_metadata?.first_name as
          | string
          | undefined,
        lastName: authData.user.user_metadata?.last_name as string | undefined,
        emailConfirmedAt: authData.user.email_confirmed_at
          ? new Date(authData.user.email_confirmed_at)
          : undefined,
      },
      requiresEmailConfirmation,
    };
  }

  async signIn(data: SignInData): Promise<SignInResult> {
    const { data: authData, error } = await this.client.auth.signInWithPassword(
      {
        email: data.email,
        password: data.password,
      }
    );

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new EmailNotConfirmedError();
      }
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_credentials')
      ) {
        throw new InvalidCredentialsError();
      }
      throw new SupabaseAuthError(error.message);
    }

    if (!authData.user || !authData.session) {
      throw new InvalidCredentialsError();
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        emailConfirmedAt: authData.user.email_confirmed_at
          ? new Date(authData.user.email_confirmed_at)
          : undefined,
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at,
      },
    };
  }

  async signOut(accessToken: string): Promise<void> {
    const { error } = await this.client.auth.admin.signOut(accessToken);

    if (error) {
      throw new SupabaseAuthError(error.message);
    }
  }

  async verifyToken(accessToken: string): Promise<VerifyTokenResult | null> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email!,
    };
  }

  async verifyEmailCallback(
    tokenHash: string,
    type: string
  ): Promise<VerifyEmailCallbackResult> {
    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email',
    });

    if (error) {
      throw new SupabaseAuthError(error.message);
    }

    if (!data.user || !data.session) {
      throw new SupabaseAuthError('Email verification failed');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: data.user.user_metadata?.first_name as string | undefined,
        lastName: data.user.user_metadata?.last_name as string | undefined,
        emailConfirmedAt: data.user.email_confirmed_at
          ? new Date(data.user.email_confirmed_at)
          : undefined,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }
}
