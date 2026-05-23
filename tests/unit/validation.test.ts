import { describe, it, expect } from 'vitest';
import { isValidEmail, parseBooking, parseContact, LIMITS } from '../../src/lib/validation.js';

function fd(entries: Record<string, string>): FormData {
	const f = new FormData();
	for (const [k, v] of Object.entries(entries)) f.set(k, v);
	return f;
}

describe('isValidEmail', () => {
	it('accepts valid addresses', () => {
		expect(isValidEmail('mette@example.dk')).toBe(true);
		expect(isValidEmail('a.b-c@sub.domain.com')).toBe(true);
	});

	it('rejects invalid addresses', () => {
		expect(isValidEmail('')).toBe(false);
		expect(isValidEmail('not-an-email')).toBe(false);
		expect(isValidEmail('missing@domain')).toBe(false);
		expect(isValidEmail('two@@at.dk')).toBe(false);
	});
});

describe('parseBooking', () => {
	it('parses a valid booking and trims fields', () => {
		const { data, error } = parseBooking(
			fd({ service: 'Vanecoaching', name: '  Anna  ', email: 'anna@example.dk' })
		);
		expect(error).toBeUndefined();
		expect(data?.name).toBe('Anna');
		expect(data?.service).toBe('Vanecoaching');
	});

	it('requires a service', () => {
		const { error } = parseBooking(fd({ name: 'Anna', email: 'anna@example.dk' }));
		expect(error).toBeTruthy();
	});

	it('requires a valid email', () => {
		const { error } = parseBooking(fd({ service: 'Vanecoaching', name: 'Anna', email: 'nope' }));
		expect(error).toBeTruthy();
	});

	it('truncates over-long messages', () => {
		const { data } = parseBooking(
			fd({
				service: 'Vanecoaching',
				name: 'Anna',
				email: 'anna@example.dk',
				message: 'x'.repeat(5000)
			})
		);
		expect(data?.message.length).toBe(LIMITS.message);
	});
});

describe('parseContact', () => {
	it('parses a valid contact', () => {
		const { data, error } = parseContact(
			fd({ name: 'Sofie', email: 'sofie@example.dk', message: 'Hej' })
		);
		expect(error).toBeUndefined();
		expect(data?.message).toBe('Hej');
	});

	it('requires a message', () => {
		const { error } = parseContact(fd({ name: 'Sofie', email: 'sofie@example.dk' }));
		expect(error).toBeTruthy();
	});
});
