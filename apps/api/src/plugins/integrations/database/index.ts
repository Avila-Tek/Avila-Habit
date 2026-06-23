import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import fp from 'fastify-plugin';
import { Pool } from 'pg';
import { envs } from '@/config';
import * as schema from '@/database';

declare module 'fastify' {
  interface FastifyInstance {
    db: NodePgDatabase<typeof schema>;
  }
}

export default fp(
  async (server) => {
    const pool = new Pool({
      connectionString: envs.database,
    });

    const db = drizzle(pool, { schema });

    server.decorate('db', db);

    server.addHook('onClose', async () => {
      await pool.end();
    });
  },
  { name: 'database' }
);
