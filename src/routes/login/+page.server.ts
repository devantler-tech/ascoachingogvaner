import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { validateAdminCode, createAdminSession, getAdminSession } from '$lib/server/auth.js';
import { setAdminSessionCookie, setDevAdminSessionCookie } from '$lib/server/cookies.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
	const adminSessionId = cookies.get('admin_session');
	if (adminSessionId) {
		if (env.DEV_SKIP_AUTH === 'true' || (await getAdminSession(adminSessionId))) {
			throw redirect(302, '/admin');
		}
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString().trim() ?? '';

		if (!code) {
			return fail(400, { error: 'Indtast venligst adgangskoden' });
		}

		if (env.DEV_SKIP_AUTH === 'true') {
			if (code.toUpperCase() === 'ADMIN' || validateAdminCode(code)) {
				setDevAdminSessionCookie(cookies);
				throw redirect(303, '/admin');
			}
			return fail(400, { error: 'Dev mode: brug koden ADMIN' });
		}

		if (!validateAdminCode(code)) {
			return fail(400, { error: 'Forkert adgangskode. Prøv igen.' });
		}

		let sessionId: string;
		try {
			sessionId = await createAdminSession();
		} catch (err) {
			console.error('Failed to create admin session:', err);
			return fail(500, { error: 'Der opstod en serverfejl. Prøv igen senere.' });
		}

		setAdminSessionCookie(cookies, sessionId);
		throw redirect(303, '/admin');
	}
};
