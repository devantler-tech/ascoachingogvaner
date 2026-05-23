<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Log ind — AS Coaching og Vaner</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="grid min-h-screen place-items-center bg-canvas px-6">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage-500 text-canvas">
				<Icon name="leaf" size={22} />
			</span>
			<h1 class="mt-4 text-2xl text-forest-900">Administration</h1>
			<p class="mt-1 text-sm text-muted">Log ind for at se bookinger og henvendelser.</p>
		</div>

		<form method="POST" use:enhance class="space-y-5">
			<div>
				<label for="code" class="mb-1.5 block text-sm font-medium text-forest-900">Adgangskode</label>
				<input
					id="code"
					name="code"
					type="password"
					required
					autocomplete="current-password"
					class="w-full rounded-xl border border-sage-300 bg-surface px-4 py-3 text-ink focus:border-sage-500 focus:ring-2 focus:ring-sage-300 focus:outline-none"
				/>
			</div>
			{#if form?.error}
				<p class="text-sm font-medium text-clay">{form.error}</p>
			{/if}
			<button
				type="submit"
				class="w-full rounded-full bg-forest-700 px-7 py-3.5 font-medium text-canvas transition-colors hover:bg-forest-900"
			>
				Log ind
			</button>
		</form>

		<a href="/" class="mt-6 block text-center text-sm text-muted hover:text-forest-700">
			← Tilbage til forsiden
		</a>
	</div>
</div>
