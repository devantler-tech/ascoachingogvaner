<script lang="ts">
	import { services } from '$lib/content.js';
	import ServiceCard from './ServiceCard.svelte';

	interface Props {
		detailed?: boolean;
	}
	let { detailed = false }: Props = $props();
</script>

<div class="grid gap-6 sm:grid-cols-2">
	{#each services as service (service.slug)}
		<ServiceCard {service} {detailed} />
	{/each}
</div>
