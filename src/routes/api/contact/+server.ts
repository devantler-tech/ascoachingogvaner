import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db.js';
import { contacts } from '$lib/server/schema.js';
import { parseContact } from '$lib/validation.js';
import { sendContactNotification } from '$lib/server/email.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const { data, error } = parseContact(form);
	if (!data) {
		return json({ error }, { status: 400 });
	}

	// Dev / no-DB mode: accept but do not persist.
	if (env.DEV_SKIP_AUTH === 'true' || !env.DATABASE_URL) {
		return json({ success: true });
	}

	try {
		await db.insert(contacts).values({
			name: data.name,
			email: data.email,
			phone: data.phone || null,
			message: data.message
		});
	} catch (err) {
		console.error('Failed to store contact:', err);
		return json({ error: 'Der opstod en serverfejl. Prøv igen senere.' }, { status: 500 });
	}

	await sendContactNotification(data);
	return json({ success: true });
};
