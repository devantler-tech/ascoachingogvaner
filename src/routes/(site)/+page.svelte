<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Section from '$lib/components/Section.svelte';
	import Services from '$lib/components/Services.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { about, focusAreas, freeIntro, pricingNote } from '$lib/content.js';
</script>

<Hero />

<Section
	eyebrow="Hvad jeg hjælper med"
	title="Mere ro, mere overskud, mere dig"
	intro="Jeg arbejder med stress, angst, vaner og overspisning — altid med udgangspunkt i dig og din hverdag."
	align="center"
>
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each focusAreas as area (area.title)}
			<div class="rounded-3xl border border-sage-100 bg-surface p-6 text-center shadow-soft">
				<span
					class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage-50 text-sage-500"
				>
					<Icon name={area.icon} size={26} />
				</span>
				<h3 class="mt-4 text-xl">{area.title}</h3>
				<p class="mt-2 text-sm text-muted">{area.text}</p>
			</div>
		{/each}
	</div>
</Section>

<!-- Free intro band -->
<section class="bg-forest-700">
	<div
		class="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="max-w-2xl">
			<h2 class="text-2xl text-canvas sm:text-3xl">{freeIntro.title}</h2>
			<p class="mt-3 text-sage-100">{freeIntro.text}</p>
		</div>
		<a
			href="/book-tid"
			class="inline-flex shrink-0 items-center gap-2 rounded-full bg-canvas px-7 py-3.5 font-medium text-forest-900 transition-colors hover:bg-sage-50"
		>
			Book gratis startsamtale
			<Icon name="arrow" size={18} />
		</a>
	</div>
</section>

<Section
	eyebrow="Services"
	title="Forløb der passer til dig"
	intro="Vælg et enkelt møde eller et forløb. Alle forløb kan betales i rater."
>
	<Services />
	<p class="mt-8 text-sm text-muted">{pricingNote}</p>
</Section>

<!-- About teaser -->
<Section>
	<div class="grid items-center gap-10 rounded-[2.5rem] bg-sage-50 p-8 sm:p-12 lg:grid-cols-2">
		<div>
			<p class="mb-3 text-sm font-semibold tracking-[0.18em] text-sage-500 uppercase">Om mig</p>
			<h2 class="text-3xl">{about.lead}</h2>
			<p class="mt-4 text-muted">{about.paragraphs[0]}</p>
			<a
				href="/om-mig"
				class="mt-6 inline-flex items-center gap-2 font-medium text-forest-700 hover:text-forest-900"
			>
				Læs mere om mig
				<Icon name="arrow" size={18} />
			</a>
		</div>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each about.values as value (value.title)}
				<div class="rounded-2xl bg-surface p-5 text-center shadow-soft">
					<h3 class="text-lg">{value.title}</h3>
					<p class="mt-1 text-xs text-muted">{value.text}</p>
				</div>
			{/each}
		</div>
	</div>
</Section>
