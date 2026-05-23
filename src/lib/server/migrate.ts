import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDb, getPool } from './db.js';

// Arbitrary, app-specific advisory lock key. Held on a dedicated connection
// for the duration of migrate() so concurrent replica startups serialize
// instead of racing on the schema.
const MIGRATION_LOCK_ID = 4061985;

export async function runMigrations(): Promise<void> {
	const db = getDb();
	const client = await getPool().connect();
	try {
		await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
		await migrate(db, { migrationsFolder: './drizzle' });
	} finally {
		try {
			await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
		} finally {
			client.release();
		}
	}
}
