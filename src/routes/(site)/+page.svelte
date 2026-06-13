<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Section from '$lib/components/Section.svelte';
	import Services from '$lib/components/Services.svelte';
	import ContactForm from '$lib/components/ContactForm.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { about, contact, freeIntro, pricingNote, site } from '$lib/content.js';
	import { structuredDataScript } from '$lib/structured-data.js';

	// "Ny" badge marks credentials earned this calendar year; it drops off
	// automatically once the year rolls over (recomputed on the client).
	const currentYear = new Date().getFullYear();
</script>

<svelte:head>
	<!-- schema.org JSON-LD (LocalBusiness/ProfessionalService + Service + Person),
	     built from content.ts so it stays in sync with the visible copy. {@html} is
	     the only way to emit a JSON-LD <script> in Svelte (a literal element would
	     HTML-escape the JSON and corrupt it); the payload is build-time constants,
	     not user input, and serializeJsonLd() escapes "<" so it can't break out of
	     the element — so this @html is XSS-safe. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html structuredDataScript}
</svelte:head>

<Hero />

<!-- Services -->
<Section
	id="services"
	eyebrow="Hvad jeg hjælper med"
	title="Coaching der møder dig, hvor du er"
	intro="Jeg arbejder med stress, angst, vaner og overspisning, altid med udgangspunkt i dig og din hverdag. Vi tilrettelægger forløbet efter dine behov, og alle forløb kan betales i rater."
>
	<Services detailed />
	<p class="mt-8 text-sm text-muted">{pricingNote}</p>
</Section>

<!-- Om mig -->
<Section id="om-mig" eyebrow="Om mig" title={about.lead}>
	<div class="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
		<div class="space-y-5 text-lg text-muted">
			{#each about.paragraphs as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>

		<div class="rounded-3xl border border-sage-100 bg-surface p-6 shadow-soft sm:p-7">
			<h3 class="text-sm font-semibold tracking-[0.18em] text-sage-500 uppercase">
				Uddannelse & certificeringer
			</h3>
			<ul class="mt-5 space-y-3">
				{#each about.credentials as item (item.title + item.year)}
					<li
						class="flex items-baseline justify-between gap-4 border-b border-sage-100 pb-3 last:border-0 last:pb-0"
					>
						<span class="text-sm text-ink"
							>{item.title}{#if Number(item.year) === currentYear}<span
									class="ml-2 inline-block rounded-full bg-clay px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-canvas"
									>Ny</span
								>{/if}</span
						>
						<span class="shrink-0 text-sm font-medium text-sage-500">{item.year}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="mt-10 grid gap-4 sm:grid-cols-3">
		{#each about.values as value (value.title)}
			<div class="flex items-start gap-3 rounded-2xl border border-sage-100 bg-surface p-5">
				<span class="mt-0.5 text-sage-500"><Icon name="check" size={20} /></span>
				<div>
					<h3 class="text-base">{value.title}</h3>
					<p class="mt-0.5 text-sm text-muted">{value.text}</p>
				</div>
			</div>
		{/each}
	</div>
</Section>

<!-- Kontakt & booking -->
<Section
	id="kontakt"
	eyebrow="Kontakt & booking"
	title={contact.lead}
	intro="Book en tid direkte i kalenderen, eller skriv en besked her med dine spørgsmål, så vender jeg tilbage hurtigst muligt."
>
	<div class="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
		<div class="rounded-3xl border border-sage-100 bg-surface p-7 shadow-soft sm:p-9">
			<h3 class="text-xl">Skriv en besked</h3>
			<p class="mt-1 mb-6 text-sm text-muted">{contact.text}</p>
			<ContactForm />
		</div>

		<div class="space-y-4">
			<div class="rounded-3xl bg-forest-700 p-6 text-canvas">
				<h3 class="text-xl text-canvas">{freeIntro.title}</h3>
				<p class="mt-2 text-sm text-sage-100">{freeIntro.text}</p>
				<a
					href={site.bookingUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-5 inline-flex items-center gap-2 rounded-full bg-canvas px-6 py-3 text-sm font-medium text-forest-900 transition-colors hover:bg-sage-50"
				>
					Book tid online
					<Icon name="arrow" size={18} />
				</a>
			</div>

			<a
				href="mailto:{site.email}"
				class="flex items-center gap-4 rounded-2xl border border-sage-100 bg-surface p-5 transition-colors hover:border-sage-300"
			>
				<span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sage-50 text-sage-500">
					<Icon name="mail" size={20} />
				</span>
				<span>
					<span class="block text-sm text-muted">Email</span>
					<span class="font-medium text-forest-900">{site.email}</span>
				</span>
			</a>
			<a
				href="tel:{site.phone.replace(/\s/g, '')}"
				class="flex items-center gap-4 rounded-2xl border border-sage-100 bg-surface p-5 transition-colors hover:border-sage-300"
			>
				<span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sage-50 text-sage-500">
					<Icon name="phone" size={20} />
				</span>
				<span>
					<span class="block text-sm text-muted">Telefon</span>
					<span class="font-medium text-forest-900">{site.phone}</span>
				</span>
			</a>
			<a
				href={site.mapsUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-4 rounded-2xl border border-sage-100 bg-surface p-5 transition-colors hover:border-sage-300"
			>
				<span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sage-50 text-sage-500">
					<Icon name="pin" size={20} />
				</span>
				<span>
					<span class="block text-sm text-muted">Adresse</span>
					<span class="font-medium whitespace-pre-line text-forest-900">{site.address}</span>
				</span>
			</a>
		</div>
	</div>
</Section>
