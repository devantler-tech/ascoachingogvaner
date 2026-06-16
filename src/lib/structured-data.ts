// Builds the schema.org JSON-LD graph for the site from `content.ts`, so the
// structured data stays a single source of truth with the visible copy: a price
// or text edit in content.ts flows straight into the markup. Rendered once in
// the homepage <svelte:head> (see `(site)/+page.svelte`).
import { about, coach, services, site } from './content.js';

// Stable @id fragments for the nodes, so the graph can cross-reference them.
const businessId = `${site.url}#business`;
const personId = `${site.url}#alette`;
const serviceId = (slug: string) => `${site.url}#service-${slug}`;

/**
 * Parse a Danish price label ("800 kr.", "5.300 kr.") into a plain integer
 * string ("800", "5300") for schema.org's numeric `price`. The thousands
 * separator is a dot, and the trailing "kr." also has one, so strip dots first
 * and then take the digit run.
 */
export function priceToNumber(label: string): string {
	const match = label.replace(/\./g, '').match(/\d+/);
	return match ? match[0] : '';
}

/** Split the multi-line `address` constant into schema.org PostalAddress parts. */
function postalAddress() {
	const [street = '', cityLine = ''] = site.address.split('\n');
	const cityMatch = cityLine.match(/^(\d{4})\s+(.+)$/);
	return {
		'@type': 'PostalAddress',
		streetAddress: street.trim(),
		postalCode: cityMatch ? cityMatch[1] : '',
		addressLocality: cityMatch ? cityMatch[2].trim() : cityLine.trim(),
		addressCountry: 'DK'
	};
}

/** Numeric prices across every package, used to derive the business priceRange. */
function allPrices(): number[] {
	return services
		.flatMap((s) => s.packages.map((p) => Number(priceToNumber(p.price))))
		.filter((n) => Number.isFinite(n) && n > 0);
}

/**
 * Build the schema.org `@graph`: a ProfessionalService (the business), a Person
 * (the coach) and one Service per coaching offering with its priced Offers.
 * Values are derived from content.ts; the currency is DKK.
 */
export function buildStructuredData(): Record<string, unknown> {
	const prices = allPrices();
	const priceRange = prices.length
		? `${Math.min(...prices)}–${Math.max(...prices)} DKK`
		: undefined;

	const serviceNodes = services.map((service) => ({
		'@type': 'Service',
		'@id': serviceId(service.slug),
		name: service.title,
		description: service.summary,
		serviceType: service.title,
		provider: { '@id': businessId },
		areaServed: { '@type': 'City', name: 'Haderslev' },
		offers: service.packages.map((pkg) => ({
			'@type': 'Offer',
			name: pkg.label,
			price: priceToNumber(pkg.price),
			priceCurrency: 'DKK',
			availability: 'https://schema.org/InStock'
		}))
	}));

	const business = {
		'@type': 'ProfessionalService',
		'@id': businessId,
		name: site.name,
		description: site.intro,
		slogan: site.tagline,
		url: site.url,
		logo: `${site.url}logo.png`,
		image: `${site.url}og-image.jpg`,
		telephone: site.phone,
		email: site.email,
		address: postalAddress(),
		areaServed: [
			{ '@type': 'City', name: 'Haderslev' },
			{ '@type': 'Country', name: 'Danmark' }
		],
		// Danish company registration number (CVR).
		identifier: { '@type': 'PropertyValue', propertyID: 'CVR', value: site.cvr },
		sameAs: [site.bookingUrl],
		employee: { '@id': personId },
		...(priceRange ? { priceRange } : {}),
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Coachingforløb',
			itemListElement: serviceNodes.map((node) => ({
				'@type': 'Offer',
				itemOffered: { '@id': node['@id'] }
			}))
		}
	};

	const person = {
		'@type': 'Person',
		'@id': personId,
		name: coach.name,
		jobTitle: coach.jobTitle,
		description: about.lead,
		worksFor: { '@id': businessId },
		hasCredential: about.credentials.map((credential) => ({
			'@type': 'EducationalOccupationalCredential',
			name: credential.title,
			dateCreated: credential.year
		}))
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [business, person, ...serviceNodes]
	};
}

/**
 * Serialize the graph for an inline <script type="application/ld+json">. The
 * `<` escaping prevents the JSON payload from ever closing the script element
 * early (e.g. a literal "</script>" in future copy) — the standard safe-inline
 * JSON-LD technique.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Ready-to-inject `<script type="application/ld+json">…</script>` element. */
export const structuredDataScript = `<script type="application/ld+json">${serializeJsonLd(
	buildStructuredData()
)}<\/script>`;
