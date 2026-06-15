import { describe, expect, it } from 'vitest';
import { about, coach, services, site } from './content.js';
import {
	buildStructuredData,
	priceToNumber,
	serializeJsonLd,
	structuredDataScript
} from './structured-data.js';

type Json = Record<string, unknown>;

/** Cast an unknown graph value to a record for property access in assertions. */
const rec = (value: unknown): Json => value as Json;

function graph(): Json[] {
	return buildStructuredData()['@graph'] as Json[];
}

function nodeOfType(type: string): Json {
	const found = graph().find((n) => n['@type'] === type);
	if (!found) throw new Error(`expected a ${type} node in the graph`);
	return found;
}

describe('priceToNumber', () => {
	it('strips currency and the Danish thousands separator', () => {
		expect(priceToNumber('800 kr.')).toBe('800');
		expect(priceToNumber('5.300 kr.')).toBe('5300');
		expect(priceToNumber('7.400 kr.')).toBe('7400');
	});
});

describe('buildStructuredData', () => {
	it('uses the schema.org context and a graph', () => {
		const data = buildStructuredData();
		expect(data['@context']).toBe('https://schema.org');
		expect(Array.isArray(data['@graph'])).toBe(true);
	});

	it('describes the business from content.ts', () => {
		const business = nodeOfType('ProfessionalService');
		expect(business.name).toBe(site.name);
		expect(business.description).toBe(site.intro);
		expect(business.url).toBe(site.url);
		expect(business.telephone).toBe(site.phone);
		expect(business.email).toBe(site.email);
		expect(rec(business.identifier).value).toBe(site.cvr);
		expect(business.sameAs).toContain(site.bookingUrl);
		expect(rec(business.address).addressLocality).toBe('Haderslev');
		expect(rec(business.address).postalCode).toBe('6100');
		expect(rec(business.address).addressCountry).toBe('DK');
	});

	it('emits the coach as a Person linked to the business', () => {
		const person = nodeOfType('Person');
		const business = nodeOfType('ProfessionalService');
		expect(person.name).toBe(coach.name);
		expect(person.jobTitle).toBe(coach.jobTitle);
		expect(rec(person.worksFor)['@id']).toBe(business['@id']);
		// Every credential from content flows through.
		expect(person.hasCredential).toHaveLength(about.credentials.length);
	});

	it('emits one Service per offering with DKK-priced offers matching content.ts', () => {
		const serviceNodes = graph().filter((n) => n['@type'] === 'Service');
		expect(serviceNodes).toHaveLength(services.length);

		for (const service of services) {
			const node = serviceNodes.find((n) => n.name === service.title);
			if (!node) throw new Error(`expected a Service node for ${service.title}`);
			const offers = node.offers as Json[];
			expect(offers).toHaveLength(service.packages.length);
			for (const offer of offers) {
				expect(offer.priceCurrency).toBe('DKK');
			}
			// Prices match content.ts (parsed to plain integers).
			const expected = service.packages.map((p) => priceToNumber(p.price));
			expect(offers.map((o) => o.price)).toEqual(expected);
		}
	});

	it('cross-references every Service from the business OfferCatalog', () => {
		const business = nodeOfType('ProfessionalService');
		const items = rec(business.hasOfferCatalog).itemListElement as Json[];
		const catalogIds = items.map((item) => rec(item.itemOffered)['@id']);
		const serviceIds = graph()
			.filter((n) => n['@type'] === 'Service')
			.map((n) => n['@id']);
		expect([...catalogIds].sort()).toEqual([...serviceIds].sort());
	});
});

describe('serializeJsonLd', () => {
	it('escapes "<" so the payload cannot close the script element early', () => {
		const json = serializeJsonLd({ a: '</script><!-- x' });
		expect(json).not.toContain('</script>');
		expect(json).not.toContain('<!--');
		expect(json).toContain('\\u003c');
	});

	it('produces a script element whose JSON parses back to the graph', () => {
		const inner = structuredDataScript
			.replace(/^<script type="application\/ld\+json">/, '')
			.replace(/<\/script>$/, '');
		const parsed = JSON.parse(inner) as Json;
		expect(parsed['@context']).toBe('https://schema.org');
		expect((parsed['@graph'] as Json[]).length).toBe(graph().length);
	});
});
