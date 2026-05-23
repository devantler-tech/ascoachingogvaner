<script lang="ts">
	import type { Service } from '$lib/content.js';
	import Icon from './Icon.svelte';

	interface Props {
		service: Service;
		detailed?: boolean;
	}
	let { service, detailed = false }: Props = $props();
</script>

<article
	id={service.slug}
	class="flex h-full flex-col rounded-3xl border border-sage-100 bg-surface p-7 shadow-soft scroll-mt-24"
>
	<h3 class="text-2xl">{service.title}</h3>
	<p class="mt-1 text-sm font-medium text-sage-500">{service.tagline}</p>
	<p class="mt-4 text-muted">{service.summary}</p>

	{#if detailed}
		<ul class="mt-5 space-y-2.5">
			{#each service.bullets as bullet (bullet)}
				<li class="flex items-start gap-2.5 text-sm text-ink">
					<span class="mt-0.5 text-sage-500"><Icon name="check" size={18} /></span>
					{bullet}
				</li>
			{/each}
		</ul>
	{/if}

	<div class="mt-6 space-y-2 border-t border-sage-100 pt-5">
		{#each service.packages as pkg (pkg.label)}
			<div class="flex items-baseline justify-between gap-3">
				<span class="text-sm text-muted">{pkg.label}</span>
				<span class="text-right">
					<span class="font-semibold text-forest-900">{pkg.price}</span>
					{#if pkg.note}
						<span class="ml-1 text-xs text-clay">{pkg.note}</span>
					{/if}
				</span>
			</div>
		{/each}
	</div>

	<a
		href="/book-tid?service={encodeURIComponent(service.title)}"
		class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-700 transition-colors hover:text-forest-900"
	>
		Book {service.title.toLowerCase()}
		<Icon name="arrow" size={16} />
	</a>
</article>
