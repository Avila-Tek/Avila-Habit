import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
  interface FastifyContextConfig {
    rawBody?: boolean;
  }
}

async function rawBodyPlugin(fastify: FastifyInstance): Promise<void> {
  // Remove default JSON parser so we can install buffer-based parser
  fastify.removeContentTypeParser('application/json');

  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req: FastifyRequest, body: Buffer, done) => {
      if (req.routeOptions.config?.rawBody) {
        req.rawBody = body;
      }

      try {
        const json = body.length > 0 ? JSON.parse(body.toString()) : {};
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );
}

export default fp(rawBodyPlugin, {
  name: 'payment-raw-body',
});
