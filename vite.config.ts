import adapter from '@sveltejs/adapter-static';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { flattenCascadeLayersPlugin } from './vite-plugins/flatten-cascade-layers';

export default defineConfig({
	// enhancedImages() must precede sveltekit() so it can transform <enhanced:img>.
	// flattenCascadeLayersPlugin() is enforce:'post', so its position in this
	// list is immaterial — it always runs after Tailwind emits the stylesheet.
	plugins: [
		enhancedImages(),
		tailwindcss(),
		// SvelteKit's configuration lives here since SvelteKit 3 (it no longer
		// reads a svelte.config.js file).
		sveltekit({
			preprocess: vitePreprocess(),
			// Fully static site: every route is prerendered to plain HTML (see
			// src/routes/+layout.ts). No server runtime, database or SMTP.
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: true,
				strict: true
			}),
			// Content-Security-Policy for the prerendered pages, injected at build
			// time as a <meta http-equiv> tag with SvelteKit's own inline hydration
			// script hashed — so script-src needs no 'unsafe-inline'. Only the one
			// external origin the site actually uses is allow-listed (self-hosted
			// Umami analytics; fonts are self-hosted build assets since #98).
			// Transport headers (HSTS) and frame-ancestors live in
			// docker/security-headers.conf, because a meta CSP cannot carry
			// frame-ancestors.
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self', 'https://analytics.platform.devantler.tech'],
					'style-src': ['self'],
					// SvelteKit's navigation announcer (the generated root.svelte)
					// mounts client-side with one constant inline style attribute;
					// allow exactly that attribute by hash instead of opening
					// style-src to 'unsafe-inline'. A SvelteKit upgrade that changes
					// the announcer's style breaks this hash — the security e2e test
					// fails loudly on the violation, pointing back here.
					'style-src-attr': [
						'unsafe-hashes',
						'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo='
					],
					'font-src': ['self'],
					'img-src': ['self'],
					'connect-src': ['self', 'https://analytics.platform.devantler.tech'],
					'object-src': ['none'],
					'base-uri': ['self']
				}
			}
		}),
		flattenCascadeLayersPlugin()
	],
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
