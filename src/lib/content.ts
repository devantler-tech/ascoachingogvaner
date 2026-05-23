// Single source of truth for the site's Danish copy. Editing text here updates
// it everywhere it is rendered. Prices and package details mirror the current
// ascoachingogvaner.dk offering.

export const site = {
	name: 'AS Coaching og Vaner',
	short: 'AS Coaching',
	tagline: 'Energi, nærvær og indre styrke',
	intro:
		'Få overskud i hverdagen og skab rum for personlig udvikling. Jeg hjælper dig med at finde balancen og skabe gode vaner, der giver energi.',
	email: 'kontakt@ascoachingogvaner.dk',
	phone: '+45 00 00 00 00',
	cvr: '00000000',
	location: 'Danmark'
};

export interface NavLink {
	href: string;
	label: string;
	cta?: boolean;
}

export const nav: NavLink[] = [
	{ href: '/', label: 'Forside' },
	{ href: '/services', label: 'Services' },
	{ href: '/om-mig', label: 'Om mig' },
	{ href: '/kontakt', label: 'Kontakt' },
	{ href: '/book-tid', label: 'Book tid', cta: true }
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
			{ label: '7-gangs forløb', price: '5.300 kr.', note: 'spar 300 kr.' }
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
			{ label: '10-gangs forløb', price: '8.000 kr.' }
		]
	},
	{
		slug: 'vanecoaching',
		title: 'Vanecoaching',
		tagline: 'Bryd gamle mønstre — skab vaner der giver energi',
		summary:
			'Vi bryder gamle mønstre og skaber nye vaner, der understøtter hvile og energibalance — gennem små, realistiske skridt, du kan holde fast i.',
		bullets: [
			'Kortlægning af dine nuværende vaner',
			'Små, realistiske skridt der bygger oven på hinanden',
			'Vaner der understøtter hvile og energi',
			'Opfølgning der gør forandringen varig'
		],
		packages: [
			{ label: '5-gangs forløb', price: '3.700 kr.', note: 'spar 300 kr.' },
			{ label: '7-gangs forløb', price: '5.200 kr.', note: 'spar 400 kr.' },
			{ label: '10-gangs forløb', price: '7.400 kr.', note: 'spar 600 kr.' }
		]
	},
	{
		slug: 'overspisningscoaching',
		title: 'Overspisningscoaching',
		tagline: 'Et sundere forhold til mad',
		summary:
			'Vi arbejder med følelsesmæssig spisning og udvikler et sundere forhold til mad — med fokus på at forstå dine triggere frem for at stræbe efter perfektion.',
		bullets: [
			'Forståelse af følelsesmæssig spisning',
			'Identifikation af triggere og mønstre',
			'Et roligere og mere afslappet forhold til mad',
			'Selvomsorg frem for perfektion'
		],
		packages: [
			{ label: '5-gangs forløb', price: '3.700 kr.', note: 'spar 300 kr.' },
			{ label: '7-gangs forløb', price: '5.200 kr.', note: 'spar 400 kr.' },
			{ label: '10-gangs forløb', price: '7.400 kr.', note: 'spar 600 kr.' }
		]
	}
];

export const pricingNote = 'Alle forløb kan betales i rater. Vi finder den løsning, der passer dig.';

export const freeIntro = {
	title: 'Gratis startsamtale',
	text: 'Vi starter altid med en uforpligtende samtale, hvor vi taler om, hvad du gerne vil arbejde med, og om vi er det rigtige match. Helt gratis.'
};

// Booking dropdown options — the four services plus the free intro call.
export const bookingOptions: string[] = [
	freeIntro.title,
	...services.map((s) => s.title)
];

// NOTE: placeholder bio — replace with the coach's real background, photo and
// credentials before launch.
export const about = {
	heading: 'Om mig',
	lead: 'Jeg hjælper mennesker med at finde balancen, mærke sig selv og skabe vaner, der giver energi i hverdagen.',
	paragraphs: [
		'Velkommen — jeg er glad for, at du har fundet vej hertil. Mit arbejde tager udgangspunkt i energi, nærvær og indre styrke, og i troen på, at varig forandring sker gennem små, kærlige skridt frem for hårde krav til dig selv.',
		'Med afsæt i coaching, viden om stress og angst samt enkle, kropsnære redskaber arbejder vi sammen om det, der fylder hos dig — uanset om det handler om stress, angst, vaner eller dit forhold til mad. Du sætter retningen; jeg går ved siden af dig.',
		'(Denne tekst er en midlertidig introduktion og opdateres snart med min uddannelse, baggrund og et billede.)'
	],
	values: [
		{ title: 'Nærvær', text: 'Du bliver mødt, som du er — i et trygt og fortroligt rum.' },
		{ title: 'Balance', text: 'Vi finder balancen mellem at gøre og bare at være.' },
		{ title: 'Indre styrke', text: 'Du opbygger redskaber, du kan bruge længe efter forløbet.' }
	]
};

export const contact = {
	heading: 'Kontakt',
	lead: 'Din tid, dit velvære, dit liv. Tag det første skridt mod forandring og kontakt mig i dag.',
	text: 'Skriv et par ord om, hvad du gerne vil arbejde med, så vender jeg tilbage hurtigst muligt — typisk inden for et par hverdage.'
};
