import type { Role } from '@/modules/auth/domain/entities/RoleEntity';
import type { UserSubscriptionOutput } from '@/modules/payment/application/use-case/getUserSubscription.useCase';
import type { User } from '@/modules/user/domain/entities/user.entity';
import type {
  CurrentUserResponseDto,
  CurrentUserRoleDto,
  CurrentUserSubscriptionDto,
  EmailCallbackResponseDto,
  SignInResponseDto,
  SignUpResponseDto,
} from '../dtos/auth.dto';

export class AuthMapper {
  static toSignInResponse(
    user: User,
    accessToken: string,
    refreshToken: string
  ): SignInResponseDto {
    return {
      user: {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        timezone: user.timezone,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }

  static toSignUpResponse(
    user: User | null,
    requiresEmailConfirmation: boolean
  ): SignUpResponseDto {
    return {
      user: user
        ? {
            id: user.id.value,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            timezone: user.timezone,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          }
        : null,
      requiresEmailConfirmation,
    };
  }

  static toCurrentUserResponse(
    user: User,
    subscription: UserSubscriptionOutput | null,
    role: Role | null
  ): CurrentUserResponseDto {
    return {
      id: user.id.value,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      status: user.status,
      role: role ? AuthMapper.toRoleDto(role) : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      subscription: subscription
        ? AuthMapper.toSubscriptionDto(subscription)
        : null,
    };
  }

  private static toRoleDto(role: Role): CurrentUserRoleDto {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      permissions: role.getPermissionCodes(),
    };
  }

  private static toSubscriptionDto(
    subscription: UserSubscriptionOutput
  ): CurrentUserSubscriptionDto {
    return {
      id: subscription.id,
      status: subscription.status,
      isFree: subscription.isFree,
      currentPeriodStart:
        subscription.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      plan: {
        id: subscription.plan.id,
        key: subscription.plan.key,
        name: subscription.plan.name,
        isFree: subscription.plan.isFree,
        limits: subscription.plan.limits,
      },
      price: {
        id: subscription.price.id,
        currency: subscription.price.currency,
        interval: subscription.price.interval,
        amountCents: subscription.price.amountCents,
      },
    };
  }

  static toEmailCallbackResponse(
    user: User,
    accessToken: string,
    refreshToken: string
  ): EmailCallbackResponseDto {
    return {
      user: {
        id: user.id.value,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        timezone: user.timezone,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }
}
