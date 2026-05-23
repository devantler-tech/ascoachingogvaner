<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	function fmt(value: Date | string | null): string {
		if (!value) return '—';
		const d = typeof value === 'string' ? new Date(value) : value;
		return d.toLocaleString('da-DK', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Administration — AS Coaching og Vaner</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-canvas">
	<header class="border-b border-sage-100 bg-surface">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
			<div class="flex items-center gap-2 text-forest-900">
				<span class="grid h-9 w-9 place-items-center rounded-full bg-sage-500 text-canvas">
					<Icon name="leaf" size={18} />
				</span>
				<h1 class="font-serif text-lg">Administration</h1>
			</div>
			<div class="flex items-center gap-4">
				<a href="/" class="text-sm text-muted hover:text-forest-700">Se hjemmeside</a>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="rounded-full border border-sage-300 px-4 py-2 text-sm font-medium text-forest-700 hover:bg-sage-50"
					>
						Log ud
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl space-y-12 px-5 py-10">
		<section>
			<div class="mb-4 flex items-center gap-3">
				<h2 class="text-2xl">Bookinger</h2>
				<span class="rounded-full bg-sage-100 px-3 py-0.5 text-sm text-forest-700">
					{data.bookings.length}
				</span>
			</div>

			{#if data.bookings.length === 0}
				<p class="rounded-2xl border border-dashed border-sage-300 p-8 text-center text-muted">
					Ingen bookinger endnu.
				</p>
			{:else}
				<div class="grid gap-4">
					{#each data.bookings as b (b.id)}
						<article class="rounded-2xl border border-sage-100 bg-surface p-5 shadow-soft">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p class="font-medium text-forest-900">{b.name}</p>
									<p class="text-sm text-sage-500">{b.service}</p>
								</div>
								<span class="text-xs text-muted">{fmt(b.createdAt)}</span>
							</div>
							<dl class="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
								<div class="flex gap-2">
									<dt class="text-muted">Email:</dt>
									<dd><a href="mailto:{b.email}" class="text-forest-700">{b.email}</a></dd>
								</div>
								<div class="flex gap-2">
									<dt class="text-muted">Telefon:</dt>
									<dd>{b.phone ?? '—'}</dd>
								</div>
								<div class="flex gap-2">
									<dt class="text-muted">Ønsket dato:</dt>
									<dd>{b.preferredDate ?? '—'}</dd>
								</div>
								<div class="flex gap-2">
									<dt class="text-muted">Ønsket tid:</dt>
									<dd>{b.preferredTime ?? '—'}</dd>
								</div>
							</dl>
							{#if b.message}
								<p class="mt-3 rounded-xl bg-sage-50 p-3 text-sm text-ink">{b.message}</p>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</section>

		<section>
			<div class="mb-4 flex items-center gap-3">
				<h2 class="text-2xl">Henvendelser</h2>
				<span class="rounded-full bg-sage-100 px-3 py-0.5 text-sm text-forest-700">
					{data.contacts.length}
				</span>
			</div>

			{#if data.contacts.length === 0}
				<p class="rounded-2xl border border-dashed border-sage-300 p-8 text-center text-muted">
					Ingen henvendelser endnu.
				</p>
			{:else}
				<div class="grid gap-4">
					{#each data.contacts as c (c.id)}
						<article class="rounded-2xl border border-sage-100 bg-surface p-5 shadow-soft">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p class="font-medium text-forest-900">{c.name}</p>
									<a href="mailto:{c.email}" class="text-sm text-forest-700">{c.email}</a>
									{#if c.phone}<span class="text-sm text-muted"> · {c.phone}</span>{/if}
								</div>
								<span class="text-xs text-muted">{fmt(c.createdAt)}</span>
							</div>
							<p class="mt-3 rounded-xl bg-sage-50 p-3 text-sm text-ink">{c.message}</p>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>
