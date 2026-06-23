import type { FastifyInstance } from 'fastify';
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
  fastify.addHook('preParsing', async (request, _reply, payload) => {
    if (request.routeOptions.config?.rawBody) {
      const chunks: Buffer[] = [];
      for await (const chunk of payload) {
        chunks.push(chunk as Buffer);
      }
      const rawBody = Buffer.concat(chunks);
      request.rawBody = rawBody;

      const { Readable } = await import('node:stream');
      return Readable.from(rawBody);
    }
    return payload;
  });
}

export default fp(rawBodyPlugin, {
  name: 'billing-raw-body',
});
