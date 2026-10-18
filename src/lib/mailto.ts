// Builds the site's `mailto:` URLs. The site is static, so a message opens the
// visitor's own mail app pre-filled rather than hitting a server.
//
// encodeURIComponent keeps spaces as %20 and newlines as %0A, which mail
// clients handle correctly (URLSearchParams would use "+" for spaces).

export interface ContactMessage {
	name: string;
	phone: string;
	email: string;
	message: string;
}

export function buildContactMailto(to: string, input: ContactMessage): string {
	const subject = `Henvendelse fra ${input.name}`;
	const body = [
		`Navn: ${input.name}`,
		`Telefon: ${input.phone}`,
		`Email: ${input.email}`,
		'',
		input.message
	].join('\n');
	return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// The "Book via mail" link: a new message with only the subject filled in, so
// the visitor writes the booking request in their own words.
export function buildBookingMailto(to: string, subject: string): string {
	return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}
