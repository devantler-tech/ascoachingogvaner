<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="grid min-h-screen place-items-center bg-canvas px-6 text-center">
	<div class="max-w-md">
		<p class="font-serif text-6xl text-sage-300">{page.status}</p>
		<h1 class="mt-4 text-2xl text-forest-900">
			{#if page.status === 404}
				Siden blev ikke fundet
			{:else}
				Noget gik galt
			{/if}
		</h1>
		<p class="mt-3 text-muted">
			{#if page.status === 404}
				Den side, du leder efter, findes ikke længere.
			{:else}
				Der opstod en uventet fejl. Prøv igen senere.
			{/if}
		</p>
		<a
			href="/"
			class="mt-8 inline-flex items-center gap-2 rounded-full bg-forest-700 px-7 py-3.5 font-medium text-canvas transition-colors hover:bg-forest-900"
		>
			Tilbage til forsiden
		</a>
	</div>
</div>
