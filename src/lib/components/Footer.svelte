<script lang="ts">
	import { nav, site } from '$lib/content.js';
	import Icon from './Icon.svelte';

	const year = new Date().getFullYear();
	const isExternal = (href: string): boolean => /^https?:\/\//.test(href);
</script>

<footer class="mt-24 border-t border-sage-100 bg-sage-50">
	<div class="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
		<div>
			<div class="flex items-center gap-2 text-forest-900">
				<img src="/logo.png" alt="" class="h-10 w-10 rounded-full object-cover" />
				<span class="font-serif text-lg">{site.name}</span>
			</div>
			<p class="mt-4 max-w-xs text-sm text-muted">{site.tagline}. {site.intro}</p>
		</div>

		<div>
			<h2 class="text-sm font-semibold tracking-wide text-forest-900 uppercase">Sider</h2>
			<ul class="mt-4 space-y-2 text-sm">
				{#each nav as link (link.href)}
					<li>
						<a
							href={link.href}
							target={isExternal(link.href) ? '_blank' : undefined}
							rel={isExternal(link.href) ? 'noopener noreferrer' : undefined}
							class="text-muted transition-colors hover:text-forest-700">{link.label}</a
						>
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<h2 class="text-sm font-semibold tracking-wide text-forest-900 uppercase">Kontakt</h2>
			<ul class="mt-4 space-y-3 text-sm text-muted">
				<li class="flex items-center gap-2">
					<Icon name="mail" size={16} />
					<a href="mailto:{site.email}" class="hover:text-forest-700">{site.email}</a>
				</li>
				<li class="flex items-center gap-2">
					<Icon name="phone" size={16} />
					<a href="tel:{site.phone.replace(/\s/g, '')}" class="hover:text-forest-700">{site.phone}</a>
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-0.5 shrink-0"><Icon name="pin" size={16} /></span>
					<a
						href={site.mapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="whitespace-pre-line hover:text-forest-700">{site.address}</a
					>
				</li>
			</ul>
		</div>
	</div>

	<div class="border-t border-sage-100">
		<div
			class="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"
		>
			<p>© {year} {site.name}. Alle rettigheder forbeholdes.</p>
			<p>CVR {site.cvr}</p>
		</div>
	</div>
</footer>
