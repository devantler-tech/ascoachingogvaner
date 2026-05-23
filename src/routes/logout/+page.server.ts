import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { deleteAdminSession } from '$lib/server/auth.js';
import { clearAdminSessionCookie } from '$lib/server/cookies.js';
import type { Actions } from './$types.js';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const adminSessionId = cookies.get('admin_session');
		if (adminSessionId && env.DEV_SKIP_AUTH !== 'true') {
			await deleteAdminSession(adminSessionId);
		}
		clearAdminSessionCookie(cookies);
		throw redirect(303, '/login');
	}
};
