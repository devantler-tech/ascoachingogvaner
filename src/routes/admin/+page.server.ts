import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db.js';
import { bookings, contacts } from '$lib/server/schema.js';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import type { Booking, Contact } from '$lib/server/schema.js';

function getMockData(): { bookings: Booking[]; contacts: Contact[] } {
	const now = new Date();
	return {
		bookings: [
			{
				id: 1,
				service: 'Gratis startsamtale',
				name: 'Mette Jensen',
				email: 'mette@example.dk',
				phone: '12 34 56 78',
				preferredDate: '2026-06-02',
				preferredTime: 'formiddag',
				message: 'Jeg vil gerne arbejde med stress.',
				status: 'new',
				createdAt: now
			},
			{
				id: 2,
				service: 'Vanecoaching',
				name: 'Anders Sørensen',
				email: 'anders@example.dk',
				phone: null,
				preferredDate: null,
				preferredTime: null,
				message: null,
				status: 'new',
				createdAt: now
			}
		],
		contacts: [
			{
				id: 1,
				name: 'Sofie Hansen',
				email: 'sofie@example.dk',
				phone: '20 30 40 50',
				message: 'Kan vi tage en samtale online?',
				handled: false,
				createdAt: now
			}
		]
	};
}

export const load: PageServerLoad = async () => {
	if (env.DEV_SKIP_AUTH === 'true') {
		return getMockData();
	}

	const [bookingRows, contactRows] = await Promise.all([
		db.select().from(bookings).orderBy(desc(bookings.createdAt)),
		db.select().from(contacts).orderBy(desc(contacts.createdAt))
	]);

	return { bookings: bookingRows, contacts: contactRows };
};
