// Single source of truth for the site's Danish copy. Editing text here updates
// it everywhere it is rendered. Prices and package details mirror the current
// ascoachingogvaner.dk offering.

import siteConfig from './site-config.json';

const address = 'Fjordagervej 20U, 1. sal\n6100 Haderslev';

// The site is fully static, so these public contact details are baked in at
// build time (no runtime env). Bookings happen in an external booking system.
export const site = {
	name: 'AS - Coaching, vaner og ro',
	tagline: 'Energi, nærvær og indre styrke',
	intro:
		'Få overskud i hverdagen og skab rum for personlig udvikling. Jeg hjælper dig med at finde balancen og skabe gode vaner, der giver energi.',
	email: 'alettekontakt@gmail.com',
	phone: '+45 21 90 63 63',
	cvr: '39561883',
	address,
	// Canonical production origin. The static `src/app.html` hardcodes this same
	// host in its <link rel="canonical"> / Open Graph tags (it can't import this
	// module); keep them in sync. Everything rendered by Svelte derives the URL
	// from here so it stays single-source.
	url: 'https://ascoachingogvaner.dk/',
	// Opens the visitor's default maps app (this Google Maps URL works on both
	// desktop and mobile, and launches the app when one is installed).
	mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\n/g, ', '))}`,
	// Defined once in site-config.json: the Docker build renders the nginx
	// /book-tid redirect from the same file, so a booking-vendor change is a
	// one-file edit (issue #100).
	bookingUrl: siteConfig.bookingUrl
};

// The coach behind the business. Her name appears in the "Om mig" prose, but is
// also kept here as a structured field so the JSON-LD `Person` (and any future
// use) reads it from a single source rather than re-parsing the copy.
export const coach = {
	name: 'Alette',
	jobTitle: 'Stresscoach og angstvejleder'
};

export interface NavLink {
	href: string;
	label: string;
	cta?: boolean;
}

// Single-page site: in-page anchors scroll to a section; "Book tid" is the one
// external link, opening the booking system.
export const nav: NavLink[] = [
	{ href: '#top', label: 'Forside' },
	{ href: '#services', label: 'Services' },
	{ href: '#om-mig', label: 'Om mig' },
	{ href: '#kontakt', label: 'Kontakt' },
	{ href: site.bookingUrl, label: 'Book tid', cta: true }
];

export interface FocusArea {
	icon: string;
	title: string;
	text: string;
}

export const focusAreas: FocusArea[] = [
	{
		icon: 'leaf',
		title: 'Stress & balance',
		text: 'Find ro i krop og sind, og genvind overskuddet i en travl hverdag.'
	},
	{
		icon: 'shield',
		title: 'Angst & tryghed',
		text: 'Forstå din angst og opbyg redskaber til mere ro, tryghed og frihed.'
	},
	{
		icon: 'spark',
		title: 'Vaner & energi',
		text: 'Bryd uhensigtsmæssige mønstre og skab nye vaner, der holder.'
	},
	{
		icon: 'heart',
		title: 'Mad & følelser',
		text: 'Et sundere og mere afslappet forhold til mad og til dig selv.'
	}
];

export interface ServicePackage {
	label: string;
	price: string;
	note?: string;
}

export interface Service {
	slug: string;
	title: string;
	tagline: string;
	summary: string;
	bullets: string[];
	packages: ServicePackage[];
}

export const services: Service[] = [
	{
		slug: 'stresscoaching',
		title: 'Stresscoaching',
		tagline: 'Find ro, balance og overskud',
		summary:
			'Stress påvirker både krop, sind, følelser og relationer. Sammen ser vi på, hvad der dræner dig, og hvordan du genfinder roen og overskuddet i hverdagen.',
		bullets: [
			'Forståelse af stress og dine egne signaler',
			'Konkrete mestrings- og afspændingsteknikker',
			'Vaner, overbevisninger og et mere positivt fokus',
			'Grænsesætning og kontakt til dine værdier'
		],
		packages: [
			{ label: 'Enkelt session', price: '800 kr.' },
			{ label: '7 sessioner', price: '5.300 kr.', note: 'spar 300 kr.' }
		]
	},
	{
		slug: 'angstvejledning',
		title: 'Angstvejledning',
		tagline: 'Skab ro, tryghed og frihed',
		summary:
			'Et grundigt forløb, hvor du lærer din angst at kende og opbygger redskaber til at møde den. Vi arbejder med både tanker, krop og adfærd.',
		bullets: [
			'Viden om angst og hvordan den virker',
			'Realistiske tanker og metakognitive øvelser',
			'Regulering af nervesystemet',
			'Gradvis eksponering, problemløsning og selvtillid'
		],
		packages: [
			{ label: 'Enkelt session', price: '800 kr.' },
			{ label: '10 sessioner', price: '8.000 kr.' }
		]
	},
	{
		slug: 'vanecoaching',
		title: 'Vanecoaching',
		tagline: 'Bryd gamle mønstre og skab nye vaner, der giver energi',
		summary:
			'Vi bryder gamle mønstre og skaber nye vaner, der understøtter hvile og energibalance gennem små, realistiske skridt, du kan holde fast i.',
		bullets: [
			'Kortlægning af dine nuværende vaner',
			'Små, realistiske skridt der bygger oven på hinanden',
			'Vaner der understøtter hvile og energi',
			'Opfølgning der gør forandringen varig'
		],
		packages: [
			{ label: 'Enkelt session', price: '800 kr.' },
			{ label: '5 sessioner', price: '3.700 kr.', note: 'spar 300 kr.' },
			{ label: '7 sessioner', price: '5.200 kr.', note: 'spar 400 kr.' },
			{ label: '10 sessioner', price: '7.400 kr.', note: 'spar 600 kr.' }
		]
	},
	{
		slug: 'overspisningscoaching',
		title: 'Overspisningscoaching',
		tagline: 'Et sundere forhold til mad',
		summary:
			'Vi arbejder med følelsesmæssig spisning og udvikler et sundere forhold til mad, med fokus på at forstå dine triggere frem for at stræbe efter perfektion.',
		bullets: [
			'Forståelse af følelsesmæssig spisning',
			'Identifikation af triggere og mønstre',
			'Et roligere og mere afslappet forhold til mad',
			'Selvomsorg frem for perfektion'
		],
		packages: [
			{ label: 'Enkelt session', price: '800 kr.' },
			{ label: '5 sessioner', price: '3.700 kr.', note: 'spar 300 kr.' },
			{ label: '7 sessioner', price: '5.200 kr.', note: 'spar 400 kr.' },
			{ label: '10 sessioner', price: '7.400 kr.', note: 'spar 600 kr.' }
		]
	}
];

export const pricingNote = 'Alle forløb kan betales i rater. Vi finder den løsning, der passer dig.';

export const freeIntro = {
	title: 'Gratis startsamtale',
	text: 'Vi starter altid med en uforpligtende samtale, hvor vi taler om, hvad du gerne vil arbejde med, og om vi er det rigtige match. Helt gratis.'
};

export const about = {
	heading: 'Om mig',
	lead: 'Jeg brænder for at hjælpe mennesker med at finde indre ro, balance og overskud i hverdagen.',
	paragraphs: [
		'Jeg hedder Alette. Min vej ind i coaching er personlig: jeg har selv haft stress inde på livet to gange og har kæmpet med angst, et svært forhold til mad og traumer fra barndommen. Den rejse lærte mig, hvad der skal til for at finde tilbage til sig selv, og det er præcis det, jeg i dag hjælper andre med.',
		'Gennem snart otte år har jeg arbejdet som personlig træner og vanecoach hos Fitliv i Haderslev, og det gør jeg fortsat på deltid. Jeg har en professionsbachelor i ernæring og sundhed og uddannet personlig træner, vanecoach og overspisningscoach.',
		'Senere har jeg specialiseret mig i det sociale nervesystem, restorativ sanseterapi og udviklingstraumer, og jeg er certificeret stresscoach og angstvejleder. I forløbene kombinerer jeg viden om nervesystemet med konkrete, kropsnære redskaber, så vi sammen kan arbejde med stress, angst, vaner og dit forhold til mad. Du sætter retningen, og jeg går ved siden af dig.'
	],
	values: [
		{ title: 'Nærvær', text: 'Du bliver mødt, som du er, i et trygt og fortroligt rum.' },
		{ title: 'Balance', text: 'Vi finder balancen mellem at gøre og bare at være.' },
		{ title: 'Indre styrke', text: 'Du opbygger redskaber, du kan bruge længe efter forløbet.' }
	],
	// Uddannelse & certificeringer (fra det gamle site), nyeste først.
	credentials: [
		{ year: '2026', title: 'Certificeret stresscoach' },
		{ year: '2026', title: 'Certificeret angstvejleder' },
		{ year: '2025', title: 'Speciale i restorativ sanseterapi' },
		{ year: '2023', title: 'Speciale i det sociale nervesystem' },
		{ year: '2023', title: 'Speciale i udviklingstraumer' },
		{ year: '2019', title: 'Certificeret overspisningscoach' },
		{ year: '2018', title: 'Certificeret vanecoach' },
		{ year: '2018', title: 'Professionsbachelor i ernæring og sundhed' },
		{ year: '2017', title: 'Certificeret personlig træner' }
	]
};

export const contact = {
	heading: 'Kontakt',
	lead: 'Din tid, dit velvære, dit liv. Tag det første skridt mod forandring og kontakt mig i dag.',
	text: 'Skriv et par ord om, hvad du gerne vil arbejde med, så vender jeg tilbage hurtigst muligt, typisk inden for et par hverdage.'
};
