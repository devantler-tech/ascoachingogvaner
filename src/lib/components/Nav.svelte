<script lang="ts">
	import { onMount } from 'svelte';
	import { nav, site } from '$lib/content.js';
	import Icon from './Icon.svelte';

	let open = $state(false);
	let activeId = $state('top');

	// Scroll-spy: highlight the nav link for whichever section is currently in view.
	onMount(() => {
		const sections = nav
			.map((link) => document.getElementById(link.href.replace(/^#/, '')))
			.filter((el): el is HTMLElement => el !== null);
		if (sections.length === 0) return;

		// Deterministically pick the last section whose top has scrolled past a
		// reference line, recomputed from layout on every crossing. This avoids
		// relying on the unspecified ordering of the observer's entries array (and
		// the "last intersecting wins" race when several sections overlap).
		const update = () => {
			const line = window.innerHeight * 0.45;
			let current = sections[0].id;
			for (const el of sections) {
				if (el.getBoundingClientRect().top <= line) current = el.id;
			}
			activeId = current;
		};

		// The thin band only serves to wake the observer near each section boundary.
		const observer = new IntersectionObserver(update, { rootMargin: '-45% 0px -50% 0px' });
		for (const el of sections) observer.observe(el);
		update();
		return () => observer.disconnect();
	});

	const isActive = (href: string): boolean => href === `#${activeId}`;
	const isExternal = (href: string): boolean => /^https?:\/\//.test(href);
</script>

<header class="sticky top-0 z-40 border-b border-sage-100 bg-canvas/85 backdrop-blur">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
		<a href="#top" class="flex items-center gap-2 text-forest-900" onclick={() => (open = false)}>
			<img src="/logo.png" alt="" class="h-10 w-10 rounded-full object-cover" />
			<span class="font-serif text-lg leading-tight">{site.name}</span>
		</a>

		<ul class="hidden items-center gap-1 md:flex">
			{#each nav as link (link.href)}
				<li>
					{#if link.cta}
						<a
							href={link.href}
							target={isExternal(link.href) ? '_blank' : undefined}
							rel={isExternal(link.href) ? 'noopener noreferrer' : undefined}
							class="ml-2 inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2 text-sm font-medium text-canvas transition-colors hover:bg-forest-900"
						>
							{link.label}
							<Icon name="arrow" size={16} />
						</a>
					{:else}
						<a
							href={link.href}
							class="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-forest-700 {isActive(
								link.href
							)
								? 'text-forest-700'
								: 'text-muted'}"
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							{link.label}
						</a>
					{/if}
				</li>
			{/each}
		</ul>

		<button
			class="grid h-10 w-10 place-items-center rounded-full text-forest-900 md:hidden"
			onclick={() => (open = !open)}
			aria-label={open ? 'Luk menu' : 'Åbn menu'}
			aria-expanded={open}
		>
			<Icon name={open ? 'close' : 'menu'} />
		</button>
	</nav>

	{#if open}
		<div class="border-t border-sage-100 bg-canvas md:hidden">
			<ul class="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
				{#each nav as link (link.href)}
					<li>
						<a
							href={link.href}
							target={isExternal(link.href) ? '_blank' : undefined}
							rel={isExternal(link.href) ? 'noopener noreferrer' : undefined}
							onclick={() => (open = false)}
							class="block rounded-lg px-4 py-3 text-base font-medium {link.cta
								? 'bg-forest-700 text-center text-canvas'
								: isActive(link.href)
									? 'bg-sage-50 text-forest-700'
									: 'text-muted'}"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</header>
