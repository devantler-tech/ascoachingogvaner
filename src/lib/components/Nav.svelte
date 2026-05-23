<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/content.js';
	import Icon from './Icon.svelte';

	let open = $state(false);

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<header class="sticky top-0 z-40 border-b border-sage-100 bg-canvas/85 backdrop-blur">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
		<a href="/" class="flex items-center gap-2 text-forest-900" onclick={() => (open = false)}>
			<span
				class="grid h-9 w-9 place-items-center rounded-full bg-sage-500 text-canvas"
				aria-hidden="true"
			>
				<Icon name="leaf" size={18} />
			</span>
			<span class="font-serif text-lg leading-tight">{site.short}</span>
		</a>

		<ul class="hidden items-center gap-1 md:flex">
			{#each nav as link (link.href)}
				<li>
					{#if link.cta}
						<a
							href={link.href}
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
