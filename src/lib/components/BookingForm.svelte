<script lang="ts">
	import { page } from '$app/state';
	import { bookingOptions } from '$lib/content.js';
	import { createSubmitHandler } from '$lib/submit-helper.js';
	import Icon from './Icon.svelte';

	const requested = page.url.searchParams.get('service');
	let selected = $state(
		requested && bookingOptions.includes(requested) ? requested : bookingOptions[0]
	);

	let saved = $state(false);
	let error = $state(false);

	const handleSubmit = createSubmitHandler((s) => {
		saved = s.saved;
		error = s.error;
	});

	const field =
		'w-full rounded-xl border border-sage-300 bg-surface px-4 py-3 text-ink placeholder-muted/60 focus:border-sage-500 focus:ring-2 focus:ring-sage-300 focus:outline-none';
	const label = 'mb-1.5 block text-sm font-medium text-forest-900';
</script>

<form method="POST" action="/api/booking" onsubmit={handleSubmit} class="space-y-5">
	<div>
		<label class={label} for="b-service">Ydelse</label>
		<select class={field} id="b-service" name="service" bind:value={selected} required>
			{#each bookingOptions as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="grid gap-5 sm:grid-cols-2">
		<div>
			<label class={label} for="b-name">Navn</label>
			<input class={field} id="b-name" name="name" type="text" required autocomplete="name" />
		</div>
		<div>
			<label class={label} for="b-phone">Telefon</label>
			<input class={field} id="b-phone" name="phone" type="tel" autocomplete="tel" />
		</div>
	</div>

	<div>
		<label class={label} for="b-email">Email</label>
		<input class={field} id="b-email" name="email" type="email" required autocomplete="email" />
	</div>

	<div class="grid gap-5 sm:grid-cols-2">
		<div>
			<label class={label} for="b-date">Ønsket dato</label>
			<input class={field} id="b-date" name="preferredDate" type="date" />
		</div>
		<div>
			<label class={label} for="b-time">Ønsket tidspunkt</label>
			<input class={field} id="b-time" name="preferredTime" type="text" placeholder="fx formiddag" />
		</div>
	</div>

	<div>
		<label class={label} for="b-message">Besked (valgfri)</label>
		<textarea
			class={field}
			id="b-message"
			name="message"
			rows="4"
			placeholder="Hvad vil du gerne arbejde med?"
		></textarea>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<button
			type="submit"
			class="inline-flex items-center gap-2 rounded-full bg-forest-700 px-7 py-3.5 font-medium text-canvas transition-colors hover:bg-forest-900"
		>
			Send forespørgsel
			<Icon name="arrow" size={18} />
		</button>
		{#if saved}
			<p class="flex items-center gap-2 text-sm font-medium text-forest-700">
				<Icon name="check" size={18} /> Tak — din forespørgsel er modtaget. Jeg kontakter dig for at aftale tid.
			</p>
		{/if}
		{#if error}
			<p class="text-sm font-medium text-clay">Noget gik galt. Prøv igen, eller ring til mig.</p>
		{/if}
	</div>
</form>
