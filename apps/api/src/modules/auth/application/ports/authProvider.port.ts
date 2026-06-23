export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthProviderUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailConfirmedAt?: Date;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface VerifyTokenResult {
  userId: string;
  email: string;
}

export interface SignUpResult {
  user: AuthProviderUser | null;
  requiresEmailConfirmation: boolean;
}

export interface SignInResult {
  user: AuthProviderUser;
  session: AuthSession;
}

export interface VerifyEmailCallbackResult {
  user: AuthProviderUser;
  session: AuthSession;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface IAuthProvider {
  signUp(data: SignUpData): Promise<SignUpResult>;
  signIn(data: SignInData): Promise<SignInResult>;
  signOut(accessToken: string): Promise<void>;
  verifyToken(accessToken: string): Promise<VerifyTokenResult | null>;
  verifyEmailCallback(
    tokenHash: string,
    type: string,
    email?: string
  ): Promise<VerifyEmailCallbackResult>;
  verifyOtp?(data: VerifyOtpData): Promise<VerifyEmailCallbackResult>;
  sendOtp?(email: string): Promise<void>;
  forgotPassword?(email: string): Promise<void>;
  resetPassword?(data: ResetPasswordData): Promise<void>;
}
