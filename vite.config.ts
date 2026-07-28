import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { flattenCascadeLayersPlugin } from './vite-plugins/flatten-cascade-layers';

export default defineConfig({
	// enhancedImages() must precede sveltekit() so it can transform <enhanced:img>.
	// flattenCascadeLayersPlugin() is enforce:'post', so its position in this
	// list is immaterial — it always runs after Tailwind emits the stylesheet.
	plugins: [enhancedImages(), tailwindcss(), sveltekit(), flattenCascadeLayersPlugin()],
	environments: {
		client: {
			build: {
				// The oldest browsers the site still has to render on are the
				// terminal releases for macOS 10.13 High Sierra: Safari 13.1.2,
				// Chrome 116 and Firefox 115 ESR. Safari 13.1 is the binding
				// constraint — without this target, Svelte 5's client runtime
				// ships private class fields (Safari 14.1+) and logical
				// assignment (Safari 14+). Both are *parse* errors, so the
				// hydration import rejects and no client behaviour runs.
				//
				// Scoped to the client environment on purpose: the prerender
				// pass runs under this repo's Node (>=22), so downlevelling it
				// buys nothing and would needlessly transform SvelteKit's
				// server runtime (which uses top-level await).
				target: ['safari13.1', 'chrome116', 'firefox115', 'edge116']
			}
		}
	},
	test: {
		include: [
			'src/**/*.{test,spec}.{js,ts}',
			'tests/unit/**/*.{test,spec}.{js,ts}',
			'vite-plugins/**/*.{test,spec}.{js,ts}'
		]
	}
});
