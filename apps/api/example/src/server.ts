import fastifyAutoload from '@fastify/autoload';
import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';

export async function createServer() {
  const server = Fastify();

  await loadPluginComponent(server, 'modules');
  await loadPluginComponent(server, 'plugins/middlewares');

  // routes
  await server.ready();
  return server;
}

async function loadPluginComponent(
  server: FastifyInstance,
  componentPath: string
) {
  await server.register(fastifyAutoload, {
    dir: path.join(__dirname, componentPath),
  });
}
