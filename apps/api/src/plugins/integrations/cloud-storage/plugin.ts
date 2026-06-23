import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { CloudStorageProvider } from './CloudStorage';

declare module 'fastify' {
  interface FastifyInstance {
    cloudStorageProvider: CloudStorageProvider;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const cloudStorageProvider = new CloudStorageProvider();
  fastify.decorate('cloudStorageProvider', cloudStorageProvider);
});
