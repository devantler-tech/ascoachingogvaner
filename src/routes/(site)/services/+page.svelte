<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Services from '$lib/components/Services.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { pricingNote, freeIntro } from '$lib/content.js';
</script>

<svelte:head>
	<title>Services — AS Coaching og Vaner</title>
	<meta
		name="description"
		content="Stresscoaching, angstvejledning, vanecoaching og overspisningscoaching. Se forløb og priser."
	/>
</svelte:head>

<Section
	eyebrow="Services"
	title="Coaching der møder dig, hvor du er"
	intro="Uanset om det handler om stress, angst, vaner eller dit forhold til mad, tilrettelægger vi forløbet efter dine behov. Alle forløb kan betales i rater."
>
	<Services detailed />
	<p class="mt-8 text-sm text-muted">{pricingNote}</p>
</Section>

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
