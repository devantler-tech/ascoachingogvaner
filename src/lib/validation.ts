// Shared, dependency-free input validation used by the booking and contact
// endpoints (and unit-tested directly).

export const LIMITS = {
	name: 255,
	email: 255,
	phone: 60,
	service: 120,
	dateTime: 40,
	message: 2000
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
	const v = value.trim();
	return v.length > 0 && v.length <= LIMITS.email && EMAIL_RE.test(v);
}

export function clean(value: FormDataEntryValue | null, max: number): string {
	return (value?.toString() ?? '').trim().slice(0, max);
}

export interface BookingInput {
	service: string;
	name: string;
	email: string;
	phone: string;
	preferredDate: string;
	preferredTime: string;
	message: string;
}

export interface ContactInput {
	name: string;
	email: string;
	phone: string;
	message: string;
}

export function parseBooking(form: FormData): { data?: BookingInput; error?: string } {
	const data: BookingInput = {
		service: clean(form.get('service'), LIMITS.service),
		name: clean(form.get('name'), LIMITS.name),
		email: clean(form.get('email'), LIMITS.email),
		phone: clean(form.get('phone'), LIMITS.phone),
		preferredDate: clean(form.get('preferredDate'), LIMITS.dateTime),
		preferredTime: clean(form.get('preferredTime'), LIMITS.dateTime),
		message: clean(form.get('message'), LIMITS.message)
	};
	if (!data.service) return { error: 'Vælg venligst en ydelse' };
	if (!data.name) return { error: 'Indtast venligst dit navn' };
	if (!isValidEmail(data.email)) return { error: 'Indtast venligst en gyldig email' };
	return { data };
}

export function parseContact(form: FormData): { data?: ContactInput; error?: string } {
	const data: ContactInput = {
		name: clean(form.get('name'), LIMITS.name),
		email: clean(form.get('email'), LIMITS.email),
		phone: clean(form.get('phone'), LIMITS.phone),
		message: clean(form.get('message'), LIMITS.message)
	};
	if (!data.name) return { error: 'Indtast venligst dit navn' };
	if (!isValidEmail(data.email)) return { error: 'Indtast venligst en gyldig email' };
	if (!data.message) return { error: 'Skriv venligst en besked' };
	return { data };
}
