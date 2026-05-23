import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function isSecure(): boolean {
	return env.NODE_ENV === 'production';
}

function baseCookieOptions() {
	return {
		path: '/',
		httpOnly: true,
		secure: isSecure(),
		sameSite: 'lax' as const,
		maxAge: SESSION_MAX_AGE
	};
}

export function setAdminSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set('admin_session', sessionId, baseCookieOptions());
}

export function setDevAdminSessionCookie(cookies: Cookies): void {
	cookies.set('admin_session', 'dev-admin-session', {
		...baseCookieOptions(),
		secure: false
	});
}

export function clearAdminSessionCookie(cookies: Cookies): void {
	cookies.delete('admin_session', { path: '/' });
}
