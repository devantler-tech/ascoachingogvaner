<script lang="ts">
	import { createSubmitHandler } from '$lib/submit-helper.js';
	import Icon from './Icon.svelte';

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

<form method="POST" action="/api/contact" onsubmit={handleSubmit} class="space-y-5">
	<div class="grid gap-5 sm:grid-cols-2">
		<div>
			<label class={label} for="c-name">Navn</label>
			<input class={field} id="c-name" name="name" type="text" required autocomplete="name" />
		</div>
		<div>
			<label class={label} for="c-phone">Telefon</label>
			<input class={field} id="c-phone" name="phone" type="tel" autocomplete="tel" />
		</div>
	</div>
	<div>
		<label class={label} for="c-email">Email</label>
		<input class={field} id="c-email" name="email" type="email" required autocomplete="email" />
	</div>
	<div>
		<label class={label} for="c-message">Besked</label>
		<textarea class={field} id="c-message" name="message" rows="5" required></textarea>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<button
			type="submit"
			class="inline-flex items-center gap-2 rounded-full bg-forest-700 px-7 py-3.5 font-medium text-canvas transition-colors hover:bg-forest-900"
		>
			Send besked
			<Icon name="arrow" size={18} />
		</button>
		{#if saved}
			<p class="flex items-center gap-2 text-sm font-medium text-forest-700">
				<Icon name="check" size={18} /> Tak — din besked er sendt. Jeg vender tilbage hurtigst muligt.
			</p>
		{/if}
		{#if error}
			<p class="text-sm font-medium text-clay">Noget gik galt. Prøv igen, eller skriv til mig direkte.</p>
		{/if}
	</div>
</form>
