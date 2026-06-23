import { authDocs } from '@repo/schemas';
import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const registerAuthRoutes: FastifyPluginAsyncZod = async function (
  fastify: FastifyInstance
): Promise<void> {
  fastify.route({
    method: 'POST',
    url: '/sign-in',
    schema: authDocs.signIn,
    handler: fastify.authController.signIn,
  });

  fastify.route({
    method: 'POST',
    url: '/sign-up',
    schema: authDocs.signUp,
    handler: fastify.authController.signUp,
  });

  fastify.route({
    method: 'POST',
    url: '/sign-out',
    schema: authDocs.signOut,
    handler: fastify.authController.signOut,
  });

  fastify.route({
    method: 'GET',
    url: '/current-user',
    schema: authDocs.currentUser,
    handler: fastify.authController.currentUser,
  });

  fastify.route({
    method: 'GET',
    url: '/callback',
    schema: authDocs.emailCallback,
    handler: fastify.authController.emailCallback,
  });

  fastify.route({
    method: 'POST',
    url: '/send-otp',
    schema: authDocs.sendOtp,
    handler: fastify.authController.sendOtp,
  });

  fastify.route({
    method: 'POST',
    url: '/verify-otp',
    schema: authDocs.verifyOtp,
    handler: fastify.authController.verifyOtp,
  });

  fastify.route({
    method: 'POST',
    url: '/forgot-password',
    schema: authDocs.forgotPassword,
    handler: fastify.authController.forgotPassword,
  });

  fastify.route({
    method: 'POST',
    url: '/reset-password',
    schema: authDocs.resetPassword,
    handler: fastify.authController.resetPassword,
  });

  fastify.route({
    method: 'GET',
    url: '/google',
    schema: authDocs.googleAuth,
    handler: fastify.authController.googleAuth,
  });
};
