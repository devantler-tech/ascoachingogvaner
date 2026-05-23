import { env } from '$env/dynamic/private';
import type { Booking, Contact } from './schema.js';

// Email notifications are best-effort: if SMTP is not configured (e.g. local
// dev) the message is logged and the request still succeeds. A failure to send
// must never break a booking or contact submission.

function smtpConfigured(): boolean {
	return Boolean(env.SMTP_HOST && env.SMTP_PORT);
}

async function send(subject: string, body: string): Promise<void> {
	const to = env.NOTIFY_EMAIL?.trim();
	if (!smtpConfigured() || !to) {
		console.log(`[email] (not sent — SMTP not configured) ${subject}\n${body}`);
		return;
	}

	try {
		const nodemailer = (await import('nodemailer')).default;
		const transport = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: Number(env.SMTP_PORT),
			secure: Number(env.SMTP_PORT) === 465,
			auth:
				env.SMTP_USER && env.SMTP_PASS
					? { user: env.SMTP_USER, pass: env.SMTP_PASS }
					: undefined
		});
		await transport.sendMail({
			from: env.SMTP_FROM?.trim() || to,
			to,
			subject,
			text: body
		});
	} catch (err) {
		console.error('[email] failed to send notification:', err);
	}
}

export async function sendBookingNotification(booking: {
	service: string;
	name: string;
	email: string;
	phone?: string | null;
	preferredDate?: string | null;
	preferredTime?: string | null;
	message?: string | null;
}): Promise<void> {
	const body = [
		'Ny booking-forespørgsel via ascoachingogvaner.dk',
		'',
		`Ydelse:   ${booking.service}`,
		`Navn:     ${booking.name}`,
		`Email:    ${booking.email}`,
		`Telefon:  ${booking.phone ?? '—'}`,
		`Ønsket dato: ${booking.preferredDate ?? '—'}`,
		`Ønsket tid:  ${booking.preferredTime ?? '—'}`,
		'',
		'Besked:',
		booking.message ?? '—'
	].join('\n');
	await send(`Ny booking: ${booking.service} — ${booking.name}`, body);
}

export async function sendContactNotification(contact: {
	name: string;
	email: string;
	phone?: string | null;
	message: string;
}): Promise<void> {
	const body = [
		'Ny kontakt-henvendelse via ascoachingogvaner.dk',
		'',
		`Navn:    ${contact.name}`,
		`Email:   ${contact.email}`,
		`Telefon: ${contact.phone ?? '—'}`,
		'',
		'Besked:',
		contact.message
	].join('\n');
	await send(`Ny henvendelse fra ${contact.name}`, body);
}

export type { Booking, Contact };
