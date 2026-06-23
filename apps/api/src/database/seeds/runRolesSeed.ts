/**
 * Script to seed the roles and permissions tables.
 *
 * Usage: npx tsx src/database/seeds/runRolesSeed.ts
 *
 * This script creates the initial roles (USER, ADMIN) with their respective permissions.
 * It's safe to run multiple times - it will skip existing entries.
 *
 * Make sure to have the following environment variable set:
 * - DATABASE (required)
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../index';
import { seedRolesAndPermissions } from '../roles/roles.seed';

async function main() {
  console.log('🌱 Starting roles and permissions seed...\n');

  const databaseUrl = process.env.DATABASE;
  if (!databaseUrl) {
    throw new Error('DATABASE environment variable is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
    await seedRolesAndPermissions(db);
    console.log('\n✅ Roles seed completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error running seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
