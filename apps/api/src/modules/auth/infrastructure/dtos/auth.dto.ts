export interface SignInRequestDto {
  email: string;
  password: string;
}

export interface SignUpRequestDto {
  email: string;
  password: string;
  rePassword: string;
  name?: string;
}

export interface SignInResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    timezone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    timezone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  requiresEmailConfirmation: boolean;
}

export interface CurrentUserSubscriptionDto {
  id: string;
  status: string;
  isFree: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    key: string;
    name: string;
    isFree: boolean;
    limits: {
      habitsMax: number | null;
      reportsEnabled: boolean;
      historyDays: number | null;
      remindersEnabled: boolean;
    };
  };
  price: {
    id: string;
    currency: string;
    interval: string;
    amountCents: number;
  };
}

export interface CurrentUserRoleDto {
  id: string;
  code: string;
  name: string;
  permissions: string[];
}

export interface CurrentUserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  timezone: string;
  status: string;
  role: CurrentUserRoleDto | null;
  createdAt: string;
  updatedAt: string;
  subscription: CurrentUserSubscriptionDto | null;
}

export interface EmailCallbackQueryDto {
  token_hash: string;
  type: string;
}

export interface EmailCallbackResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    timezone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}
