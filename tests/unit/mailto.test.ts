import { describe, it, expect } from 'vitest';
import { buildContactMailto } from '../../src/lib/mailto.js';

describe('buildContactMailto', () => {
	const input = {
		name: 'Anna Jensen',
		phone: '12 34 56 78',
		email: 'anna@eksempel.dk',
		message: 'Jeg vil gerne høre mere.'
	};

	it('targets the given recipient', () => {
		expect(buildContactMailto('kontakt@example.dk', input)).toMatch(/^mailto:kontakt@example\.dk\?/);
	});

	it('encodes the subject with the sender name', () => {
		expect(buildContactMailto('x@y.dk', input)).toContain(
			`subject=${encodeURIComponent('Henvendelse fra Anna Jensen')}`
		);
	});

	it('includes every field in the body', () => {
		const url = buildContactMailto('x@y.dk', input);
		const body = decodeURIComponent(url.split('&body=')[1]);
		expect(body).toContain('Navn: Anna Jensen');
		expect(body).toContain('Telefon: 12 34 56 78');
		expect(body).toContain('Email: anna@eksempel.dk');
		expect(body).toContain('Jeg vil gerne høre mere.');
	});

	it('encodes spaces as %20 and newlines as %0A (not "+")', () => {
		const url = buildContactMailto('x@y.dk', input);
		expect(url).not.toContain('+');
		expect(url).toContain('%20');
		expect(url).toContain('%0A');
	});
});
