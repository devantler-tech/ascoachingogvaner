<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { about } from '$lib/content.js';
</script>

<svelte:head>
	<title>Om mig — AS Coaching og Vaner</title>
	<meta name="description" content={about.lead} />
</svelte:head>

<Section eyebrow="Om mig" title={about.lead}>
	<div class="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
		<div class="space-y-5 text-lg text-muted">
			{#each about.paragraphs as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>

		<div class="space-y-4">
			<div class="aspect-square overflow-hidden rounded-3xl bg-sage-100 shadow-soft">
				<svg viewBox="0 0 400 400" class="h-full w-full" role="img" aria-label="Portrætplaceholder">
					<defs>
						<linearGradient id="about-g" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stop-color="#d9e2d8" />
							<stop offset="1" stop-color="#6f8c6a" />
						</linearGradient>
					</defs>
					<rect width="400" height="400" fill="url(#about-g)" />
					<circle cx="200" cy="160" r="70" fill="#f7f5f0" opacity="0.7" />
					<path d="M90 360c0-70 50-110 110-110s110 40 110 110Z" fill="#f7f5f0" opacity="0.7" />
				</svg>
			</div>
			{#each about.values as value (value.title)}
				<div class="flex items-start gap-3 rounded-2xl border border-sage-100 bg-surface p-4">
					<span class="mt-0.5 text-sage-500"><Icon name="check" size={20} /></span>
					<div>
						<h3 class="text-base">{value.title}</h3>
						<p class="text-sm text-muted">{value.text}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</Section>
