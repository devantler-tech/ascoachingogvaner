<script lang="ts">
	import { trackEvent } from '$lib/analytics.js';
	import { site } from '$lib/content.js';
	import Icon from './Icon.svelte';
</script>

<section id="top" class="relative overflow-hidden">
	<!-- soft decorative background -->
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div class="absolute inset-0 bg-gradient-to-b from-sage-50 to-canvas"></div>
		<div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sage-100 blur-3xl opacity-60"></div>
		<div class="absolute top-40 -left-24 h-80 w-80 rounded-full bg-sage-100 blur-3xl opacity-50"></div>
	</div>

	<div class="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:py-28 lg:grid-cols-2">
		<div>
			<p class="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-1.5 text-sm font-medium text-forest-700">
				<Icon name="leaf" size={16} />
				{site.tagline}
			</p>
			<h1 class="text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
				Få overskud i hverdagen og skab rum for personlig udvikling
			</h1>
			<p class="mt-6 max-w-xl text-lg text-muted">
				{site.intro}
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href={site.bookingUrl}
					target="_blank"
					rel="noopener noreferrer"
					onclick={() => trackEvent('book-intro-click')}
					class="inline-flex items-center gap-2 rounded-full bg-forest-700 px-7 py-3.5 font-medium text-canvas transition-colors hover:bg-forest-900"
				>
					Book en gratis startsamtale
					<Icon name="arrow" size={18} />
				</a>
				<a
					href="#services"
					class="inline-flex items-center gap-2 rounded-full border border-sage-300 px-7 py-3.5 font-medium text-forest-700 transition-colors hover:bg-sage-50"
				>
					Se mine ydelser
				</a>
			</div>
		</div>

		<div class="relative">
			<div class="aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage-100 shadow-soft">
				<img
					src="/alette-hero.jpg"
					alt="Alette, coach hos {site.name}"
					width="1440"
					height="1440"
					class="h-full w-full object-cover object-top"
				/>
			</div>
			<div
				class="absolute -bottom-5 -left-5 hidden rounded-2xl bg-surface px-5 py-4 shadow-soft sm:block"
			>
				<p class="text-sm font-medium text-forest-900">Gratis startsamtale</p>
				<p class="text-xs text-muted">Uforpligtende. Vi finder ud af, om vi matcher.</p>
			</div>
		</div>
	</div>
</section>
