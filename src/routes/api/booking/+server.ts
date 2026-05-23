import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db.js';
import { bookings } from '$lib/server/schema.js';
import { parseBooking } from '$lib/validation.js';
import { sendBookingNotification } from '$lib/server/email.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const { data, error } = parseBooking(form);
	if (!data) {
		return json({ error }, { status: 400 });
	}

	// Dev mode only: accept but do not persist. In any real deployment a
	// missing DATABASE_URL must fail loudly (below) rather than silently drop.
	if (env.DEV_SKIP_AUTH === 'true') {
		return json({ success: true });
	}

	try {
		await db.insert(bookings).values({
			service: data.service,
			name: data.name,
			email: data.email,
			phone: data.phone || null,
			preferredDate: data.preferredDate || null,
			preferredTime: data.preferredTime || null,
			message: data.message || null
		});
	} catch (err) {
		console.error('Failed to store booking:', err);
		return json({ error: 'Der opstod en serverfejl. Prøv igen senere.' }, { status: 500 });
	}

	await sendBookingNotification(data);
	return json({ success: true });
};
