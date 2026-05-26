<script lang="ts">
	import { site } from '$lib/content.js';
	import { buildContactMailto } from '$lib/mailto.js';
	import Icon from './Icon.svelte';

	let opened = $state(false);

	// Static site: the message opens the visitor's own mail app pre-filled.
	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const url = buildContactMailto(site.email, {
			name: String(data.get('name') ?? ''),
			phone: String(data.get('phone') ?? ''),
			email: String(data.get('email') ?? ''),
			message: String(data.get('message') ?? '')
		});
		opened = true;
		window.location.href = url;
	}

	// Native validation bubbles ("tooltips") follow the browser's UI language by
	// default, so we set Danish messages ourselves and clear them again on input.
	function setDanishValidity(e: Event) {
		const el = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		const v = el.validity;
		let message = '';
		if (v.valueMissing) message = 'Udfyld venligst dette felt.';
		else if (v.typeMismatch) message = 'Indtast venligst en gyldig e-mailadresse.';
		el.setCustomValidity(message);
	}
	function clearValidity(e: Event) {
		(e.currentTarget as HTMLInputElement | HTMLTextAreaElement).setCustomValidity('');
	}

	const field =
		'w-full rounded-xl border border-sage-300 bg-surface px-4 py-3 text-ink placeholder-muted/60 focus:border-sage-500 focus:ring-2 focus:ring-sage-300 focus:outline-none';
	const label = 'mb-1.5 block text-sm font-medium text-forest-900';
</script>

<form onsubmit={handleSubmit} class="space-y-5">
	<div class="grid gap-5 sm:grid-cols-2">
		<div>
			<label class={label} for="c-name">Navn</label>
			<input
				class={field}
				id="c-name"
				name="name"
				type="text"
				required
				maxlength="100"
				autocomplete="name"
				placeholder="Fx Anna Jensen"
				oninvalid={setDanishValidity}
				oninput={clearValidity}
			/>
		</div>
		<div>
			<label class={label} for="c-phone">Telefon</label>
			<input
				class={field}
				id="c-phone"
				name="phone"
				type="tel"
				required
				maxlength="40"
				autocomplete="tel"
				placeholder="Fx 12 34 56 78"
				oninvalid={setDanishValidity}
				oninput={clearValidity}
			/>
		</div>
	</div>
	<div>
		<label class={label} for="c-email">Email</label>
		<input
			class={field}
			id="c-email"
			name="email"
			type="email"
			required
			maxlength="254"
			autocomplete="email"
			placeholder="Fx anna@eksempel.dk"
			oninvalid={setDanishValidity}
			oninput={clearValidity}
		/>
	</div>
	<div>
		<label class={label} for="c-message">Besked</label>
		<textarea
			class={field}
			id="c-message"
			name="message"
			rows="5"
			required
			maxlength="1500"
			placeholder="Fortæl gerne lidt om, hvad du gerne vil arbejde med, hvad der fylder hos dig lige nu, og hvornår det passer dig at tale sammen."
			oninvalid={setDanishValidity}
			oninput={clearValidity}
		></textarea>
		<p class="mt-1.5 text-xs text-muted">
			Jo mere du fortæller om din situation, jo bedre kan jeg hjælpe dig.
		</p>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<button
			type="submit"
			class="inline-flex items-center gap-2 rounded-full bg-forest-700 px-7 py-3.5 font-medium text-canvas transition-colors hover:bg-forest-900"
		>
			Send besked
			<Icon name="arrow" size={18} />
		</button>
		{#if opened}
			<p class="flex items-center gap-2 text-sm font-medium text-forest-700">
				<Icon name="check" size={18} /> Din mailapp åbner med beskeden. Tryk send, så hører du fra mig hurtigst
				muligt.
			</p>
		{/if}
	</div>
</form>
