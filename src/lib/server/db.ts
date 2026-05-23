import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

let _db: NodePgDatabase<typeof schema> | undefined;
let _pool: pg.Pool | undefined;

export function getDb(): NodePgDatabase<typeof schema> {
	if (!_db) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString && process.env.DEV_SKIP_AUTH !== 'true') {
			throw new Error('DATABASE_URL environment variable is required');
		}
		_pool = new pg.Pool({
			...(connectionString ? { connectionString } : {})
		});
		_db = drizzle(_pool, { schema });
	}
	return _db;
}

export function getPool(): pg.Pool {
	getDb();
	if (!_pool) throw new Error('Database pool is not initialized');
	return _pool;
}

// Re-export for convenience — lazy initialized on first access
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
	get(_target, prop) {
		return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
	}
});
