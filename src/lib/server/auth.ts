import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { db } from './db.js';
import { adminSessions } from './schema.js';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_DURATION_DAYS = 30;
const DEV_ADMIN_CODE = 'ascoachingadmin1234';

export function getAdminCode(): string {
	const code = env.ADMIN_CODE?.trim();
	if (code) return code;
	if (env.NODE_ENV === 'production' && env.DEV_SKIP_AUTH !== 'true') {
		throw new Error('ADMIN_CODE environment variable is required in production');
	}
	return DEV_ADMIN_CODE;
}

export function validateAdminCode(code: string): boolean {
	const expected = getAdminCode().toLowerCase();
	const provided = code.trim().toLowerCase();
	if (provided.length !== expected.length) return false;
	return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function createAdminSession(): Promise<string> {
	const sessionId = randomBytes(32).toString('hex');
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

	await db.insert(adminSessions).values({
		id: sessionId,
		expiresAt
	});

	return sessionId;
}

export async function getAdminSession(sessionId: string): Promise<boolean> {
	const [session] = await db
		.select({ id: adminSessions.id })
		.from(adminSessions)
		.where(and(eq(adminSessions.id, sessionId), gt(adminSessions.expiresAt, new Date())))
		.limit(1);

	return !!session;
}

export async function deleteAdminSession(sessionId: string): Promise<void> {
	await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
}
