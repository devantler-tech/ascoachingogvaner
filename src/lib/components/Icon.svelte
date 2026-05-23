<script lang="ts">
	// Lightweight inline icon set (stroke-based, inherits currentColor).
	interface Props {
		name: string;
		size?: number;
		class?: string;
	}
	let { name, size = 24, class: cls = '' }: Props = $props();

	const paths: Record<string, string> = {
		leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Zm0 0c0-4 1-8 5-12',
		shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
		spark: 'M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-5.5L14 9m-4 6-2.5 2.5m9 0L14 15m-4-6L7.5 6.5',
		heart: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
		menu: 'M4 6h16M4 12h16M4 18h16',
		close: 'M6 6l12 12M18 6 6 18',
		arrow: 'M5 12h14m-6-6 6 6-6 6',
		check: 'M20 6 9 17l-5-5',
		mail: 'M4 5h16v14H4zM4 7l8 6 8-6',
		phone: 'M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
		pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
		clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
		calendar: 'M8 2v4m8-4v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
		quote: 'M7 7H4v6h6V7H7Zm10 0h-3v6h6V7h-3Z'
	};
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={cls}
	aria-hidden="true"
>
	<path d={paths[name] ?? ''} />
</svg>
