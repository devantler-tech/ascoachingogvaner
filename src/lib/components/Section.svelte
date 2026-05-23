<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		eyebrow?: string;
		title?: string;
		intro?: string;
		align?: 'left' | 'center';
		children: Snippet;
	}
	let { id, eyebrow, title, intro, align = 'left', children }: Props = $props();
</script>

<section {id} class="mx-auto max-w-6xl px-5 py-16 sm:py-20">
	{#if eyebrow || title || intro}
		<div class="max-w-2xl {align === 'center' ? 'mx-auto text-center' : ''}">
			{#if eyebrow}
				<p class="mb-3 text-sm font-semibold tracking-[0.18em] text-sage-500 uppercase">
					{eyebrow}
				</p>
			{/if}
			{#if title}
				<h2 class="text-3xl leading-tight sm:text-4xl">{title}</h2>
			{/if}
			{#if intro}
				<p class="mt-4 text-lg text-muted">{intro}</p>
			{/if}
		</div>
	{/if}
	<div class={eyebrow || title || intro ? 'mt-12' : ''}>
		{@render children()}
	</div>
</section>
