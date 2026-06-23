import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import { AuthorizationService } from '@/modules/auth/application/services/authorization.service';
import { RolePostgresRepository } from '@/modules/auth/infrastructure/persistent/RolePostgresRepository';
import type { User } from '@/modules/user/domain/entities/user.entity';

export interface PermissionMiddlewareOptions {
  permissionCode: string;
}

/**
 * Middleware factory that validates user has specific permission
 * Usage: fastify.addHook('preHandler', requirePermission({ permissionCode: 'user:create' }))
 */
export function requirePermission(options: PermissionMiddlewareOptions) {
  return async (
    request: FastifyRequest & { user?: User },
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const server = request.server as FastifyInstance;
    const roleRepository = new RolePostgresRepository(server.db);
    const authService = new AuthorizationService(
      server.userRepository,
      roleRepository
    );

    const hasPermission = await authService.hasPermission({
      userId: request.user.id.value,
      permissionCode: options.permissionCode,
    });

    if (!hasPermission) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: `Permission denied: ${options.permissionCode}`,
        },
      });
    }
  };
}

/**
 * Require specific role
 * Usage: fastify.addHook('preHandler', requireRole({ roleCode: 'ADMIN' }))
 */
export function requireRole(options: { roleCode: string }) {
  return async (
    request: FastifyRequest & { user?: User },
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const server = request.server as FastifyInstance;
    const roleRepository = new RolePostgresRepository(server.db);
    const userRole = await roleRepository.findById(request.user.roleId ?? '');

    if (!userRole || userRole.code !== options.roleCode) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: `Role required: ${options.roleCode}`,
        },
      });
    }
  };
}

/**
 * Require any of the specified permissions
 * Usage: fastify.addHook('preHandler', requireAnyPermission(['user:create', 'user:admin:create']))
 */
export function requireAnyPermission(permissionCodes: string[]) {
  return async (
    request: FastifyRequest & { user?: User },
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const server = request.server as FastifyInstance;
    const roleRepository = new RolePostgresRepository(server.db);
    const authService = new AuthorizationService(
      server.userRepository,
      roleRepository
    );

    for (const permissionCode of permissionCodes) {
      const hasPermission = await authService.hasPermission({
        userId: request.user.id.value,
        permissionCode,
      });

      if (hasPermission) {
        return; // Allow if any permission matches
      }
    }

    return reply.status(403).send({
      error: {
        code: 'FORBIDDEN',
        message: `Permission denied. Required any of: ${permissionCodes.join(', ')}`,
      },
    });
  };
}
