<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import BookingForm from '$lib/components/BookingForm.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { freeIntro, pricingNote } from '$lib/content.js';

	const steps = [
		{ icon: 'calendar', title: 'Send forespørgsel', text: 'Vælg ydelse og dit ønskede tidspunkt.' },
		{ icon: 'phone', title: 'Jeg kontakter dig', text: 'Vi bekræfter en tid, der passer dig.' },
		{ icon: 'leaf', title: 'Vi går i gang', text: 'Du møder op — online eller fysisk.' }
	];
</script>

<svelte:head>
	<title>Book tid — AS Coaching og Vaner</title>
	<meta
		name="description"
		content="Book en gratis startsamtale eller et coachingforløb. Send en uforpligtende forespørgsel."
	/>
</svelte:head>

<Section
	eyebrow="Book tid"
	title="Tag det første skridt"
	intro="Send en uforpligtende forespørgsel, så vender jeg tilbage for at aftale en tid. Vi starter altid med en gratis startsamtale."
>
	<div class="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
		<div class="rounded-3xl border border-sage-100 bg-surface p-7 shadow-soft sm:p-9">
			<BookingForm />
		</div>

		<div class="space-y-6">
			<div class="rounded-3xl bg-sage-50 p-6">
				<h2 class="text-xl">{freeIntro.title}</h2>
				<p class="mt-2 text-sm text-muted">{freeIntro.text}</p>
			</div>
			<ol class="space-y-4">
				{#each steps as step, i (step.title)}
					<li class="flex items-start gap-4">
						<span
							class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-sage-500 shadow-soft"
						>
							<Icon name={step.icon} size={20} />
						</span>
						<div>
							<h3 class="text-base">{i + 1}. {step.title}</h3>
							<p class="text-sm text-muted">{step.text}</p>
						</div>
					</li>
				{/each}
			</ol>
			<p class="text-sm text-muted">{pricingNote}</p>
		</div>
	</div>
</Section>
